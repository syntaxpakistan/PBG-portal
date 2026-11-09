"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { PaymentMethod, ProjectStatus } from "@prisma/client";
import { saveUpload } from "@/lib/files";
import { getFeePercent } from "@/lib/settings";
import { notify, notifyAllAdmins } from "@/lib/notify";
import { WORK_STAGE_KEYS } from "@/lib/constants";
import { assertPartnerActive, isPriorityClientSubscription } from "@/lib/entitlements";
import { getGraceDays, getRfqRateLimit } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";
import { issueInvoice } from "@/lib/actions/billing";

async function audit(actorId: string, action: string, entity: string, entityId: string, meta?: string) {
  await prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta } });
}

async function nextRef(prefix: string, count: number) {
  return `${prefix}-${String(2600 + count + 1).padStart(4, "0")}`;
}

// capability routing — notify approved providers matching the RFQ's category + explicit invitees
export async function notifyProvidersForRfq(rfq: { id: string; refNo: string; title: string; organism: string; sampleCount: number; sampleType: string; serviceCategory: string; requestedOutput?: string | null; deadline?: Date | null; budgetHint?: string | null; customerId: string }, board = false) {
  const cat = rfq.serviceCategory.toLowerCase();
  const providers = await prisma.providerProfile.findMany({ where: { status: "APPROVED" } });
  const routed = providers.filter((p) =>
    !p.serviceCategories ||
    p.serviceCategories.split(",").some((c) => cat.includes(c.trim().toLowerCase()) || c.trim().toLowerCase().includes(cat))
  );
  const invitedSet = new Set(
    (await prisma.rfqInvite.findMany({ where: { rfqId: rfq.id }, select: { providerId: true } })).map((i) => i.providerId)
  );
  const targets = new Map(
    [...(routed.length ? routed : providers), ...providers.filter((p) => invitedSet.has(p.id))].map((p) => [p.id, p])
  );
  // PRO/CUSTOM partners get priority routing — every capability-matched RFQ reaches them
  const prioritySubs = await prisma.subscription.findMany({
    where: { userId: { in: providers.map((p) => p.userId) }, status: "ACTIVE", plan: { in: ["PRO", "CUSTOM"] } },
    select: { userId: true },
  });
  const priorityUsers = new Set(prioritySubs.map((s) => s.userId));
  for (const p of providers) {
    if (priorityUsers.has(p.userId) && (routed.some((r) => r.id === p.id) || invitedSet.has(p.id))) targets.set(p.id, p);
  }
  // Pro/Custom clients get priority matching — their RFQs are flagged so labs see them first
  const clientSub = await prisma.subscription.findUnique({
    where: { userId: rfq.customerId },
    select: { plan: true, status: true, expiresAt: true },
  });
  const priorityClient = isPriorityClientSubscription(clientSub, await getGraceDays());
  const details = [
    `${rfq.title}`,
    `${rfq.serviceCategory} · ${rfq.organism} · ${rfq.sampleCount} × ${rfq.sampleType}`,
    rfq.requestedOutput ? `Output: ${rfq.requestedOutput}` : null,
    rfq.deadline ? `Deadline: ${rfq.deadline.toLocaleDateString()}` : null,
    rfq.budgetHint ? `Budget hint: ${rfq.budgetHint}` : null,
    priorityClient ? "Priority client — paid plan member" : null,
  ].filter(Boolean).join(" — ");
  for (const p of targets.values()) {
    await notify({
      toUserId: p.userId,
      subject: `${priorityClient ? "Priority client — " : ""}${invitedSet.has(p.id) ? `You were invited to quote: ${rfq.refNo}` : board ? `New request on the board: ${rfq.refNo}` : `New RFQ routed to you: ${rfq.refNo}`}`,
      body: `${details}. Open your lab portal to review the full request and submit a sealed quote.`,
      href: `/lab/rfqs/${rfq.id}`,
    });
  }
}

// ---------- customer ----------

export async function createRfq(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  if (!rateLimit(`rfq:${session.user.id}`, await getRfqRateLimit(), 24 * 3600e3)) {
    throw new Error("Too many RFQs — please try again tomorrow.");
  }

  // server-side duplicate guard — repeated clicks/submits must not create twins
  const dupe = await prisma.rfq.findFirst({
    where: {
      customerId: session.user.id,
      title: String(formData.get("title")),
      organism: String(formData.get("organism")),
      status: { not: "CANCELLED" },
      createdAt: { gt: new Date(Date.now() - 10 * 60e3) },
    },
    select: { id: true },
  });
  if (dupe) throw new Error("This looks like a duplicate — you already submitted the same request moments ago.");

  const inviteIds = formData.getAll("inviteIds").map(String).filter(Boolean);
  const board = formData.get("visibility") === "BOARD";
  const count = await prisma.rfq.count();
  const rfq = await prisma.rfq.create({
    data: {
      refNo: await nextRef("RFQ", count),
      customerId: session.user.id,
      title: String(formData.get("title")),
      organism: String(formData.get("organism")),
      sampleCount: Number(formData.get("sampleCount")),
      sampleType: String(formData.get("sampleType")),
      serviceCategory: String(formData.get("serviceCategory")),
      requestedOutput: String(formData.get("requestedOutput")),
      analysisType: String(formData.get("analysisType") || "") || null,
      deadline: formData.get("deadline") ? new Date(String(formData.get("deadline"))) : null,
      budgetHint: String(formData.get("budgetHint") || "") || null,
      attachmentName: null,
      attachmentKey: null,
      visibility: board ? "BOARD" : "ROUTED",
      moderation: board ? "PENDING" : "APPROVED",
    },
  });
  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    await prisma.rfq.update({
      where: { id: rfq.id },
      data: { attachmentName: file.name, attachmentKey: saved.key },
    });
  }
  await audit(session.user.id, "RFQ_CREATED", "Rfq", rfq.id, rfq.refNo);

  // targeted invites: record them (approved providers only)
  if (inviteIds.length) {
    const invited = await prisma.providerProfile.findMany({
      where: { id: { in: inviteIds }, status: "APPROVED" },
    });
    if (invited.length) {
      await prisma.rfqInvite.createMany({
        data: invited.map((p) => ({ rfqId: rfq.id, providerId: p.id })),
      });
    }
  }

  // board posts go through admin moderation before any lab sees them
  if (board) {
    const custOrg = (await prisma.customerProfile.findUnique({ where: { userId: session.user.id }, select: { orgName: true, orgType: true } }));
    await notifyAllAdmins(
      `Request-board post awaiting approval: ${rfq.refNo}`,
      [
        `${custOrg?.orgName ?? session.user.name}${custOrg?.orgType ? ` (${custOrg.orgType})` : ""} posted "${rfq.title}"`,
        `${rfq.serviceCategory} · ${rfq.organism} · ${rfq.sampleCount} × ${rfq.sampleType}`,
        rfq.requestedOutput ? `Output: ${rfq.requestedOutput}` : null,
        rfq.deadline ? `Deadline: ${rfq.deadline.toLocaleDateString()}` : null,
        rfq.budgetHint ? `Budget: ${rfq.budgetHint}` : null,
      ].filter(Boolean).join(" — ") + ". Review it in the moderation queue.",
      "/admin/moderation"
    );
  } else {
    await notifyProvidersForRfq(rfq);
  }
  redirect(`/dashboard/rfqs/${rfq.id}`);
}

// hard-delete an RFQ — only before a quote is awarded (quotes/invites/declines cascade)
export async function deleteRfq(rfqId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  const rfq = await prisma.rfq.findUniqueOrThrow({
    where: { id: rfqId },
    include: { project: { select: { id: true } } },
  });
  if (rfq.customerId !== session.user.id) throw new Error("Not your RFQ");
  if (rfq.project || rfq.status === "AWARDED") {
    throw new Error("This request already has an awarded project — it can't be deleted.");
  }
  await prisma.rfq.delete({ where: { id: rfqId } });
  await audit(session.user.id, "RFQ_DELETED", "Rfq", rfqId, rfq.refNo);
  revalidatePath("/dashboard/rfqs");
  redirect("/dashboard/rfqs");
}

export async function selectQuote(quoteId: string, poNumber?: string) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");

  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { rfq: true, provider: true },
  });
  if (quote.rfq.customerId !== session.user.id) throw new Error("Not your RFQ");
  if (quote.rfq.status !== "OPEN") throw new Error("RFQ already awarded");
  if (quote.validUntil && quote.validUntil < new Date()) throw new Error("This quote has expired — ask the lab to re-submit");

  const count = await prisma.project.count();
  const feePercent = await getFeePercent();
  await prisma.$transaction([
    prisma.quote.update({ where: { id: quoteId }, data: { status: "SELECTED" } }),
    prisma.quote.updateMany({ where: { rfqId: quote.rfqId, NOT: { id: quoteId }, status: "SUBMITTED" }, data: { status: "DECLINED" } }),
    prisma.rfq.update({ where: { id: quote.rfqId }, data: { status: "AWARDED" } }),
    prisma.project.create({
      data: {
        refNo: `PRJ-${String(1000 + count + 1)}`,
        rfqId: quote.rfqId,
        quoteId: quote.id,
        customerId: session.user.id,
        providerUserId: quote.provider.userId,
        providerId: quote.providerId,
        poNumber: poNumber?.trim() || null,
        status: "OFFER_SELECTED",
        history: {
          create: { status: "OFFER_SELECTED", note: "Customer selected offer", changedById: session.user.id },
        },
        transaction: {
          create: {
            quotedValue: quote.price + quote.taxAmount,
            feePercent,
            feeAmount: Math.round((quote.price + quote.taxAmount) * (feePercent / 100)),
          },
        },
      },
    }),
  ]);
  const proj = await prisma.project.findUniqueOrThrow({ where: { quoteId } });
  await audit(session.user.id, "QUOTE_SELECTED", "Quote", quoteId, `${quote.rfq.refNo} → ${proj.refNo}`);
  await notify({
    toUserId: quote.provider.userId,
    subject: `You were awarded ${proj.refNo} — accept or decline`,
    body: `The customer selected your offer on "${quote.rfq.title}" (PKR ${(quote.price + quote.taxAmount).toLocaleString()} · ${quote.turnaroundDays}d TAT). Review and accept the project in your lab portal — or decline if you can't take it on.`,
    href: `/lab/projects/${proj.id}`,
  });
  // let the competing labs know their sealed quote wasn't selected — no prices disclosed
  const losers = await prisma.quote.findMany({
    where: { rfqId: quote.rfqId, status: "DECLINED" },
    include: { provider: { select: { userId: true } } },
  });
  for (const l of losers) {
    await notify({
      toUserId: l.provider.userId,
      subject: `${quote.rfq.refNo} awarded — your quote wasn't selected`,
      body: `The customer chose another provider's offer on "${quote.rfq.title}". Your sealed quote stayed confidential throughout. New requests keep routing to your capabilities.`,
      href: "/lab/rfqs",
    });
  }
  redirect(`/dashboard/projects/${proj.id}`);
}

export async function postMessage(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const allowed = [project.customerId, project.providerUserId];
  const isAdmin = session.user.role === "ADMIN";
  if (!allowed.includes(session.user.id) && !isAdmin) throw new Error("Not in this project");
  const file = formData.get("attachment");
  let attachmentName: string | null = null;
  let attachmentKey: string | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    attachmentName = file.name;
    attachmentKey = saved.key;
  }
  await prisma.message.create({
    data: { projectId, senderId: session.user.id, body: String(formData.get("body")), attachmentName, attachmentKey },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/admin`);
}

// ---------- provider ----------

// server-side mirror of the board gate — pending/rejected board posts are only
// quotable by explicitly invited labs; everything else must be OPEN + visible
async function assertRfqQuotable(rfqId: string, providerId: string) {
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId }, select: { status: true, visibility: true, moderation: true } });
  if (!rfq || rfq.status !== "OPEN") throw new Error("RFQ is not open");
  if (rfq.visibility === "BOARD" && rfq.moderation !== "APPROVED") {
    const invited = await prisma.rfqInvite.findUnique({ where: { rfqId_providerId: { rfqId, providerId } } });
    if (!invited) throw new Error("This request isn't open for quoting yet");
  }
}

export async function submitQuote(rfqId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  if (profile.status !== "APPROVED") throw new Error("Not verified");
  await assertPartnerActive(session.user.id);
  await assertRfqQuotable(rfqId, profile.id);

  const data = {
    price: Number(formData.get("price")),
    taxAmount: Number(formData.get("taxAmount") || 0),
    turnaroundDays: Number(formData.get("turnaroundDays")),
    estTurnaround: formData.get("estTurnaround") ? Number(formData.get("estTurnaround")) : null,
    platform: String(formData.get("platform")),
    deliverables: String(formData.get("deliverables") || "") || null,
    scope: String(formData.get("scope") || "") || null,
    validUntil: formData.get("validUntil") ? new Date(String(formData.get("validUntil"))) : null,
    exclusions: String(formData.get("exclusions") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  };
  const quote = await prisma.quote.upsert({
    where: { rfqId_providerId: { rfqId, providerId: profile.id } },
    update: data,
    create: { rfqId, providerId: profile.id, ...data },
  });
  await audit(session.user.id, "QUOTE_SUBMITTED", "Quote", quote.id, `RFQ ${rfqId} · ${quote.price}`);
  const rfq = await prisma.rfq.findUnique({ where: { id: rfqId }, select: { customerId: true, refNo: true } });
  if (rfq) await notify({
    toUserId: rfq.customerId,
    subject: `New quote on ${rfq.refNo} — ${profile.orgName}`,
    body: `${profile.orgName} submitted a sealed offer: PKR ${(quote.price + quote.taxAmount).toLocaleString()} all-in · ${quote.turnaroundDays} days TAT · ${quote.platform}. Sign in to compare it against other offers.`,
    href: `/dashboard/rfqs/${rfqId}`,
  });
  revalidatePath("/lab");
  redirect("/lab");
}

// provider opts out of a routed RFQ — stays invisible to the customer
export async function declineRfq(rfqId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const reason = String(formData.get("reason") || "") || undefined;
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await assertRfqQuotable(rfqId, profile.id);
  await prisma.rfqDecline.upsert({
    where: { rfqId_providerId: { rfqId, providerId: profile.id } },
    update: { reason: reason || null },
    create: { rfqId, providerId: profile.id, reason: reason || null },
  });
  await audit(session.user.id, "RFQ_DECLINED", "Rfq", rfqId, reason);
  revalidatePath("/lab");
  redirect("/lab");
}

// provider withdraws a submitted quote before award
export async function withdrawQuote(rfqId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  const quote = await prisma.quote.findUnique({ where: { rfqId_providerId: { rfqId, providerId: profile.id } } });
  if (!quote || quote.status !== "SUBMITTED") throw new Error("Quote can't be withdrawn");
  const rfq = await prisma.rfq.findUniqueOrThrow({ where: { id: rfqId }, select: { status: true, customerId: true, refNo: true } });
  if (rfq.status !== "OPEN") throw new Error("RFQ is no longer open");
  await prisma.quote.update({ where: { id: quote.id }, data: { status: "WITHDRAWN" } });
  await audit(session.user.id, "QUOTE_WITHDRAWN", "Quote", quote.id, rfqId);
  const remaining = await prisma.quote.count({ where: { rfqId, status: "SUBMITTED" } });
  await notify({
    toUserId: rfq.customerId,
    subject: `${rfq.refNo}: a quote was withdrawn`,
    body: `${profile.orgName} withdrew its sealed offer.${remaining > 0 ? ` ${remaining} other offer${remaining === 1 ? "" : "s"} still on the table.` : " No offers remain — the request stays open for new quotes."}`,
    href: `/dashboard/rfqs/${rfqId}`,
  });
  revalidatePath("/lab");
  redirect("/lab");
}

// provider accepts the awarded project — required before work can start
export async function acceptProject(projectId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: { quote: true } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (project.acceptedAt) throw new Error("Already accepted");
  if (project.status !== "OFFER_SELECTED") throw new Error("Project already underway");

  const now = new Date();
  const dueAt = new Date(now.getTime() + project.quote.turnaroundDays * 864e5);
  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { acceptedAt: now, dueAt, status: "SAMPLE_AWAITED" } }),
    prisma.statusHistory.create({ data: { projectId, status: "SAMPLE_AWAITED", note: "Provider accepted the award — awaiting samples", changedById: session.user.id } }),
    // spin up the in-lab work-stage ladder (idempotent — skipped stages may pre-exist)
    prisma.workStage.createMany({
      data: WORK_STAGE_KEYS.map((key, i) => ({ projectId, key, sort: i })),
    }),
  ]);
  await audit(session.user.id, "PROJECT_ACCEPTED", "Project", projectId, project.refNo);
  await notify({ toUserId: project.customerId, subject: `${project.refNo}: provider accepted`, body: "The lab has confirmed your project. Please arrange sample delivery.", href: `/dashboard/projects/${projectId}` });
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// provider declines an award — RFQ reopens so the customer can pick another offer
export async function declineProject(projectId: string, reason?: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { quote: true, rfq: true },
  });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (project.acceptedAt) throw new Error("Already accepted");
  if (project.status !== "OFFER_SELECTED") throw new Error("Project already underway");

  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { status: "CANCELLED" } }),
    prisma.statusHistory.create({ data: { projectId, status: "CANCELLED", note: `Provider declined${reason ? `: ${reason}` : ""}`, changedById: session.user.id } }),
    prisma.quote.update({ where: { id: project.quoteId }, data: { status: "DECLINED" } }),
    // restore competing quotes so the customer can re-select
    prisma.quote.updateMany({ where: { rfqId: project.rfqId, status: "DECLINED", NOT: { id: project.quoteId } }, data: { status: "SUBMITTED" } }),
    prisma.rfq.update({ where: { id: project.rfqId }, data: { status: "OPEN" } }),
    prisma.transaction.deleteMany({ where: { projectId } }),
  ]);
  await audit(session.user.id, "PROJECT_DECLINED", "Project", projectId, `${project.refNo}${reason ? ` · ${reason}` : ""}`);
  await notify({ toUserId: project.customerId, subject: `${project.refNo}: provider declined`, body: `The selected lab couldn't take on "${project.rfq.title}". Your RFQ is open again — you can select another offer.`, href: `/dashboard/rfqs/${project.rfqId}` });
  revalidatePath("/lab");
  redirect("/lab");
}

export async function advanceProjectStatus(projectId: string, status: ProjectStatus, note?: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id && session.user.role !== "ADMIN")
    throw new Error("Only the assigned lab or admin can advance status");
  if (!project.acceptedAt && status !== "CANCELLED" && session.user.role !== "ADMIN")
    throw new Error("Accept the award before updating status");

  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { status } }),
    prisma.statusHistory.create({
      data: { projectId, status, note: note || null, changedById: session.user.id },
    }),
  ]);
  await audit(session.user.id, "STATUS_CHANGED", "Project", projectId, `${project.refNo} → ${status}`);
  await notify({ toUserId: project.customerId, subject: `${project.refNo}: ${status.replaceAll("_", " ")}`, body: note || `Your project status has been updated.`, href: `/dashboard/projects/${projectId}` });
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// staged delivery — uploads stay lab-internal until explicitly released
export async function addResultFile(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Attach a result document");
  const saved = await saveUpload(file);
  const filename = file.name;
  const version = (await prisma.resultFile.count({ where: { projectId, filename } })) + 1;
  await prisma.resultFile.create({
    data: {
      projectId,
      filename,
      storageKey: saved.key,
      sizeBytes: saved.size,
      note: String(formData.get("note") || "") || null,
      version,
      uploadedById: session.user.id,
    },
  });
  await audit(session.user.id, "RESULT_UPLOADED", "Project", projectId, `${filename} · v${version}`);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// lab releases a deliverable to the customer — first release flips status + notifies
export async function releaseResultFile(fileId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const f = await prisma.resultFile.findUniqueOrThrow({ where: { id: fileId }, include: { project: true } });
  if (f.project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (f.released) throw new Error("Already released");
  await prisma.$transaction([
    prisma.resultFile.update({ where: { id: fileId }, data: { released: true, releasedAt: new Date() } }),
    prisma.project.update({ where: { id: f.projectId }, data: { status: "RESULTS_AVAILABLE" } }),
    prisma.statusHistory.create({
      data: { projectId: f.projectId, status: "RESULTS_AVAILABLE", note: `Deliverable released: ${f.filename} (v${f.version})`, changedById: session.user.id },
    }),
  ]);
  await audit(session.user.id, "RESULT_RELEASED", "Project", f.projectId, f.filename);
  await notify({ toUserId: f.project.customerId, subject: `${f.project.refNo}: results available`, body: `A deliverable (${f.filename}) has been released. Sign in to view and download it.`, href: `/dashboard/projects/${f.projectId}` });
  revalidatePath(`/lab/projects/${f.projectId}`);
  revalidatePath(`/dashboard/projects/${f.projectId}`);
}

export async function completeProject(projectId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.customerId !== session.user.id && session.user.role !== "ADMIN")
    throw new Error("Only the customer or admin can complete");
  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { status: "COMPLETED" } }),
    prisma.statusHistory.create({ data: { projectId, status: "COMPLETED", changedById: session.user.id } }),
  ]);
  await audit(session.user.id, "PROJECT_COMPLETED", "Project", projectId, project.refNo);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function fileComplaint(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  await prisma.complaint.create({
    data: {
      projectId,
      filedById: session.user.id,
      subject: String(formData.get("subject")),
      details: String(formData.get("details")),
    },
  });
  await audit(session.user.id, "COMPLAINT_FILED", "Project", projectId, String(formData.get("subject")));
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// ---------- sample logistics (chain of custody) ----------

// customer marks samples as shipped — courier + tracking visible to the lab
export async function shipSamples(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.customerId !== session.user.id) throw new Error("Not your project");
  if (project.status !== "SAMPLE_AWAITED") throw new Error("Project is not awaiting samples");
  const courier = String(formData.get("courier") || "") || null;
  const trackingNo = String(formData.get("trackingNo") || "") || null;
  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { shipmentCourier: courier, trackingNo, shippedAt: new Date() },
    }),
    prisma.statusHistory.create({
      data: { projectId, status: "SAMPLE_AWAITED", note: `Samples shipped via ${courier ?? "courier"}${trackingNo ? ` · tracking ${trackingNo}` : ""}`, changedById: session.user.id },
    }),
  ]);
  await notify({
    toUserId: project.providerUserId,
    subject: `${project.refNo}: samples on the way`,
    body: `Customer shipped samples via ${courier ?? "courier"}${trackingNo ? ` (tracking: ${trackingNo})` : ""}. Mark receipt + QC in your project.`,
    href: `/lab/projects/${projectId}`,
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/lab/projects/${projectId}`);
}

// lab records sample receipt + QC result — moves to SAMPLE_RECEIVED
export async function receiveSamples(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (project.status !== "SAMPLE_AWAITED") throw new Error("Samples not expected yet");
  const qc = String(formData.get("sampleQc") || "PASS");
  const note = String(formData.get("qcNote") || "") || null;
  const qcLabel = qc === "PASS" ? "all samples passed QC" : qc === "PARTIAL" ? "partial QC pass — some samples flagged" : "samples failed QC";
  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { status: "SAMPLE_RECEIVED", sampleQc: qc, sampleQcNote: note } }),
    prisma.statusHistory.create({
      data: { projectId, status: "SAMPLE_RECEIVED", note: `Samples received — ${qcLabel}${note ? ` (${note})` : ""}`, changedById: session.user.id },
    }),
    // accessioning done → sample QC becomes the active stage
    prisma.workStage.updateMany({
      where: { projectId, key: "ACCESSIONING" },
      data: { status: "DONE", doneAt: new Date() },
    }),
    prisma.workStage.updateMany({
      where: { projectId, key: "SAMPLE_QC", status: "PENDING" },
      data: { status: "ACTIVE", startedAt: new Date() },
    }),
  ]);
  await audit(session.user.id, "SAMPLES_RECEIVED", "Project", projectId, `${project.refNo} · QC ${qc}`);
  await notify({
    toUserId: project.customerId,
    subject: `${project.refNo}: samples received — ${qcLabel}`,
    body: `The lab logged receipt of your samples. QC: ${qc}.${note ? ` Note: ${note}` : ""}`,
    href: `/dashboard/projects/${projectId}`,
  });
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// ---------- inside-the-lab workflow (work stages, QC gates, pause clock) ----------

// mark the stage done + activate the next pending one in order
async function advanceStageLadder(projectId: string, doneKey: string) {
  const stages = await prisma.workStage.findMany({ where: { projectId }, orderBy: { sort: "asc" } });
  const idx = stages.findIndex((s) => s.key === doneKey);
  const next = stages.find((s, i) => i > idx && s.status === "PENDING");
  await prisma.$transaction([
    prisma.workStage.updateMany({
      where: { projectId, key: doneKey, status: { not: "DONE" } },
      data: { status: "DONE", doneAt: new Date(), startedAt: stages[idx]?.startedAt ?? new Date() },
    }),
    ...(next ? [prisma.workStage.update({ where: { id: next.id }, data: { status: "ACTIVE", startedAt: new Date() } })] : []),
  ]);
}

// lab updates a work stage — start / complete / skip with operator + note
export async function setWorkStage(projectId: string, stageKey: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  const status = String(formData.get("status"));
  if (!["ACTIVE", "DONE", "SKIPPED"].includes(status)) throw new Error("Invalid stage status");
  const data = {
    status,
    operator: String(formData.get("operator") || "") || null,
    note: String(formData.get("note") || "") || null,
    ...(status === "ACTIVE" ? { startedAt: new Date() } : {}),
    ...(status === "DONE" || status === "SKIPPED" ? { doneAt: new Date() } : {}),
  };
  await prisma.workStage.update({ where: { projectId_key: { projectId, key: stageKey } }, data });
  if (status === "DONE") await advanceStageLadder(projectId, stageKey);
  await audit(session.user.id, "WORKSTAGE_UPDATED", "Project", projectId, `${project.refNo} · ${stageKey} → ${status}`);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// structured QC record — PASS closes the gate; PARTIAL/FAIL opens the customer decision loop
export async function addQcRecord(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  const stage = String(formData.get("stage"));
  if (!["SAMPLE_QC", "LIBRARY_QC"].includes(stage)) throw new Error("Invalid QC stage");
  const result = String(formData.get("result"));
  if (!["PASS", "PARTIAL", "FAIL"].includes(result)) throw new Error("Invalid QC result");
  const num = (k: string) => (formData.get(k) ? Number(formData.get(k)) : null);
  const rec = await prisma.qcRecord.create({
    data: {
      projectId,
      stage,
      result,
      concentration: num("concentration"),
      rin: num("rin"),
      ratio: num("ratio"),
      instrument: String(formData.get("instrument") || "") || null,
      note: String(formData.get("note") || "") || null,
      // clean pass closes the gate; flagged results wait on the customer's call
      decision: result === "PASS" ? "PROCEED" : null,
      decidedAt: result === "PASS" ? new Date() : null,
    },
  });
  if (result === "PASS") {
    await advanceStageLadder(projectId, stage);
    await prisma.statusHistory.create({
      data: { projectId, status: project.status, note: `${stage === "SAMPLE_QC" ? "Sample" : "Library"} QC passed — gate closed`, changedById: session.user.id },
    });
  } else {
    await prisma.workStage.updateMany({ where: { projectId, key: stage, status: "PENDING" }, data: { status: "ACTIVE", startedAt: new Date() } });
    await prisma.statusHistory.create({
      data: { projectId, status: project.status, note: `${stage === "SAMPLE_QC" ? "Sample" : "Library"} QC ${result.toLowerCase()} — customer decision required`, changedById: session.user.id },
    });
    await notify({
      toUserId: project.customerId,
      subject: `${project.refNo}: QC needs your decision`,
      body: `The lab flagged ${stage === "SAMPLE_QC" ? "sample" : "library"} QC as ${result.toLowerCase()}. Review the metrics and choose how to proceed.`,
      href: `/dashboard/projects/${projectId}`,
    });
  }
  await audit(session.user.id, "QC_RECORDED", "QcRecord", rec.id, `${project.refNo} · ${stage} · ${result}`);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// customer resolves a flagged QC — proceed w/ disclaimer, resend samples, or cancel
export async function resolveQc(qcId: string, decision: string) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  const rec = await prisma.qcRecord.findUniqueOrThrow({ where: { id: qcId }, include: { project: true } });
  if (rec.project.customerId !== session.user.id) throw new Error("Not your project");
  if (rec.decision !== null) throw new Error("Already decided");
  if (!["PROCEED", "RESEND", "CANCEL"].includes(decision)) throw new Error("Invalid decision");

  await prisma.qcRecord.update({ where: { id: qcId }, data: { decision, decidedAt: new Date() } });
  if (decision === "PROCEED") {
    await advanceStageLadder(rec.projectId, rec.stage);
    await prisma.statusHistory.create({
      data: { projectId: rec.projectId, status: rec.project.status, note: `Customer signed QC disclaimer — proceeding`, changedById: session.user.id },
    });
  } else if (decision === "RESEND") {
    await prisma.$transaction([
      prisma.project.update({
        where: { id: rec.projectId },
        data: { status: "SAMPLE_AWAITED", shippedAt: null, trackingNo: null, shipmentCourier: null },
      }),
      prisma.statusHistory.create({
        data: { projectId: rec.projectId, status: "SAMPLE_AWAITED", note: "QC flagged — customer sending replacement samples", changedById: session.user.id },
      }),
      // ladder rewinds: accessioning + QC reopen for the new batch
      prisma.workStage.updateMany({
        where: { projectId: rec.projectId, key: { in: ["ACCESSIONING", rec.stage] } },
        data: { status: "PENDING", startedAt: null, doneAt: null },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.project.update({ where: { id: rec.projectId }, data: { status: "CANCELLED" } }),
      prisma.statusHistory.create({
        data: { projectId: rec.projectId, status: "CANCELLED", note: `Customer cancelled after ${rec.stage === "SAMPLE_QC" ? "sample" : "library"} QC failure`, changedById: session.user.id },
      }),
    ]);
  }
  await notify({
    toUserId: rec.project.providerUserId,
    subject: `${rec.project.refNo}: QC decision — ${decision.toLowerCase()}`,
    body: decision === "PROCEED" ? "Customer accepted the flagged QC and signed the disclaimer — continue processing." : decision === "RESEND" ? "Customer is sending replacement samples." : "Customer cancelled the project after the flagged QC.",
    href: `/lab/projects/${rec.projectId}`,
  });
  await audit(session.user.id, "QC_RESOLVED", "QcRecord", qcId, `${rec.project.refNo} · ${decision}`);
  revalidatePath(`/dashboard/projects/${rec.projectId}`);
  revalidatePath(`/lab/projects/${rec.projectId}`);
}

// pause the SLA clock — Genohub math: due date shifts by pause duration on resume
export async function pauseProject(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (project.pausedAt) throw new Error("Already paused");
  const pausedFor = String(formData.get("pausedFor")) === "CUSTOMER" ? "CUSTOMER" : "LAB";
  const reason = String(formData.get("reason") || "") || null;
  await prisma.$transaction([
    prisma.project.update({ where: { id: projectId }, data: { pausedAt: new Date(), pausedFor, pauseReason: reason } }),
    prisma.statusHistory.create({
      data: { projectId, status: project.status, note: `Paused — waiting on ${pausedFor === "CUSTOMER" ? "customer" : "lab"}${reason ? `: ${reason}` : ""}`, changedById: session.user.id },
    }),
  ]);
  if (pausedFor === "CUSTOMER") {
    await notify({
      toUserId: project.customerId,
      subject: `${project.refNo}: the lab is waiting on you`,
      body: reason || "The lab paused the turnaround clock pending input from your side. Check the project workspace.",
      href: `/dashboard/projects/${projectId}`,
    });
  }
  await audit(session.user.id, "PROJECT_PAUSED", "Project", projectId, `${project.refNo} · ${pausedFor}`);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function resumeProject(projectId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  if (!project.pausedAt) throw new Error("Not paused");
  const now = new Date();
  const pauseMs = now.getTime() - project.pausedAt.getTime();
  const dueAt = project.dueAt ? new Date(project.dueAt.getTime() + pauseMs) : null;
  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: { pausedAt: null, pausedFor: null, pauseReason: null, dueAt },
    }),
    prisma.statusHistory.create({
      data: { projectId, status: project.status, note: `Resumed — turnaround clock restarted (due ${dueAt?.toLocaleDateString() ?? "—"})`, changedById: session.user.id },
    }),
  ]);
  await notify({
    toUserId: project.customerId,
    subject: `${project.refNo}: work resumed`,
    body: `The lab resumed your project. New estimated due date: ${dueAt?.toLocaleDateString() ?? "unchanged"}.`,
    href: `/dashboard/projects/${projectId}`,
  });
  await audit(session.user.id, "PROJECT_RESUMED", "Project", projectId, project.refNo);
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// lab-only metadata — internal accession ref, storage location, disposal date
export async function updateLabInternals(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  await prisma.project.update({
    where: { id: projectId },
    data: {
      internalId: String(formData.get("internalId") || "") || null,
      storageLoc: String(formData.get("storageLoc") || "") || null,
      disposalAt: formData.get("disposalAt") ? new Date(String(formData.get("disposalAt"))) : null,
    },
  });
  revalidatePath(`/lab/projects/${projectId}`);
}

// ---------- supplier enquiry → offer flow ----------

// supplier responds to an enquiry with a price/lead-time offer (Quartzy-style)
export async function respondEnquiry(enquiryId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") redirect("/login");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await assertPartnerActive(session.user.id);
  const e = await prisma.enquiry.findUniqueOrThrow({ where: { id: enquiryId }, include: { product: true, buyer: { select: { role: true } } } });
  if (e.supplierId !== profile.id) throw new Error("Not your enquiry");
  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      status: "QUOTED",
      quotedPrice: formData.get("quotedPrice") ? Number(formData.get("quotedPrice")) : null,
      leadTimeDays: formData.get("leadTimeDays") ? Number(formData.get("leadTimeDays")) : null,
      reply: String(formData.get("reply") || "") || null,
    },
  });
  await notify({
    toUserId: e.buyerId,
    subject: `Supplier responded: ${e.product.name}`,
    body: `${profile.orgName} replied to your enquiry for ${e.qty} × ${e.product.name}. Check your marketplace enquiries for the offer.`,
    href: e.buyer.role === "PROVIDER" ? "/lab/supplies" : "/dashboard/marketplace",
  });
  await audit(session.user.id, "ENQUIRY_QUOTED", "Enquiry", enquiryId, e.product.name);
  revalidatePath("/supplier");
}

export async function fulfilEnquiry(enquiryId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") redirect("/login");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await assertPartnerActive(session.user.id);
  const e = await prisma.enquiry.findUniqueOrThrow({
    where: { id: enquiryId },
    include: { product: { select: { name: true } }, buyer: { select: { role: true } } },
  });
  if (e.supplierId !== profile.id) throw new Error("Not your enquiry");
  await prisma.enquiry.update({ where: { id: enquiryId }, data: { status: "FULFILLED" } });
  await audit(session.user.id, "ENQUIRY_FULFILLED", "Enquiry", enquiryId);
  await notify({
    toUserId: e.buyerId,
    subject: `Enquiry fulfilled: ${e.product.name}`,
    body: `${profile.orgName} marked your enquiry for ${e.qty} × ${e.product.name} as fulfilled${e.quotedPrice != null ? ` (PKR ${e.quotedPrice.toLocaleString()})` : ""}.`,
    href: e.buyer.role === "PROVIDER" ? "/lab/supplies" : "/dashboard/marketplace",
  });
  revalidatePath("/supplier");
}

// ---------- notification feed ----------

export async function markNotificationRead(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  await prisma.notification.update({ where: { id, userId: session.user.id }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) redirect("/login");
  await prisma.notification.updateMany({ where: { userId: session.user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}

// ---------- provider service catalog ----------

export async function saveService(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await assertPartnerActive(session.user.id);
  const data = {
    name: String(formData.get("name")),
    category: String(formData.get("category")),
    platform: String(formData.get("platform") || "") || null,
    description: String(formData.get("description") || "") || null,
    priceFrom: formData.get("priceFrom") ? Number(formData.get("priceFrom")) : null,
    priceVisibility: ["PUBLIC", "MEMBERS", "QUOTE_ONLY"].includes(String(formData.get("priceVisibility")))
      ? String(formData.get("priceVisibility"))
      : "PUBLIC",
    unit: String(formData.get("unit") || "") || null,
    turnaroundDays: formData.get("turnaroundDays") ? Number(formData.get("turnaroundDays")) : null,
    // edits re-enter moderation — listing hides until admin re-approves
    moderation: "PENDING",
    moderationNote: null,
  };
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.serviceListing.update({ where: { id, providerId: profile.id }, data });
  } else {
    await prisma.serviceListing.create({ data: { ...data, providerId: profile.id } });
  }
  await notifyAllAdmins(
    `Service listing awaiting approval: ${data.name}`,
    `${profile.orgName} ${id ? "updated" : "listed"} "${data.name}" (${data.category}${data.priceFrom ? `, from PKR ${data.priceFrom}` : ""}). Review it in the moderation queue.`,
    "/admin/moderation"
  );
  revalidatePath("/lab/services");
  revalidatePath("/registry");
}

export async function setServiceActive(id: string, active: boolean) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await prisma.serviceListing.update({ where: { id, providerId: profile.id }, data: { active } });
  revalidatePath("/lab/services");
  revalidatePath("/registry");
}

export async function deleteService(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await prisma.serviceListing.delete({ where: { id, providerId: profile.id } });
  revalidatePath("/lab/services");
  revalidatePath("/registry");
}

// ---------- milestones (partial invoicing) ----------

export async function addMilestone(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.providerUserId !== session.user.id) throw new Error("Not your project");
  await prisma.milestone.create({
    data: {
      projectId,
      title: String(formData.get("title")),
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null,
    },
  });
  revalidatePath(`/lab/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function invoiceMilestone(milestoneId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") redirect("/login");
  const m = await prisma.milestone.findUniqueOrThrow({ where: { id: milestoneId }, include: { project: { include: { provider: true } } } });
  if (m.project.providerUserId !== session.user.id) throw new Error("Not your project");
  await prisma.milestone.update({ where: { id: milestoneId }, data: { status: "INVOICED" } });
  // raise a proper invoice to the customer — payment is confirmed by the lab, not self-attested
  const existing = await prisma.invoice.findFirst({ where: { milestoneId } });
  if (!existing) {
    await issueInvoice({
      billedUserId: m.project.customerId,
      issuerType: "PROVIDER",
      issuerId: m.project.providerId,
      milestoneId,
      currency: "PKR",
      dueAt: m.dueDate ?? new Date(Date.now() + 14 * 864e5),
      note: `Milestone on ${m.project.refNo}`,
      items: [{ description: `${m.project.refNo} — ${m.title}`, unitPrice: m.amount }],
    });
  }
  await notify({ toUserId: m.project.customerId, subject: `${m.project.refNo}: invoice — ${m.title}`, body: `The lab invoiced a milestone for ${m.title} (PKR ${m.amount.toLocaleString()}). Review it in your project and report payment once sent.`, href: `/dashboard/projects/${m.projectId}` });
  revalidatePath(`/lab/projects/${m.projectId}`);
  revalidatePath(`/dashboard/projects/${m.projectId}`);
  revalidatePath("/lab/billing");
  revalidatePath("/dashboard/billing");
}

const PAYMENT_METHODS = ["BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD", "CASH", "OTHER"] as const;

// customer reports a milestone payment — stays PENDING until the lab verifies it
export async function payMilestone(milestoneId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  const m = await prisma.milestone.findUniqueOrThrow({ where: { id: milestoneId }, include: { project: { include: { provider: true } } } });
  if (m.project.customerId !== session.user.id) throw new Error("Not your project");
  if (m.status !== "INVOICED") throw new Error("Milestone is not invoiced yet");
  const method = String(formData.get("method") || "");
  if (!PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) throw new Error("Select a payment method");
  const reference = String(formData.get("reference") || "") || null;
  // ensure the invoice exists (legacy milestones predating billing get one now)
  let invoice = await prisma.invoice.findFirst({ where: { milestoneId } });
  if (!invoice) {
    invoice = await issueInvoice({
      billedUserId: m.project.customerId,
      issuerType: "PROVIDER",
      issuerId: m.project.providerId,
      milestoneId,
      currency: "PKR",
      dueAt: m.dueDate ?? new Date(Date.now() + 14 * 864e5),
      note: `Milestone on ${m.project.refNo}`,
      items: [{ description: `${m.project.refNo} — ${m.title}`, unitPrice: m.amount }],
    });
  }
  const confirmed = await prisma.payment.aggregate({
    where: { invoiceId: invoice.id, status: "CONFIRMED" },
    _sum: { amount: true },
  });
  const outstanding = invoice.total - (confirmed._sum.amount ?? 0);
  if (outstanding <= 0) throw new Error("Invoice already settled");
  const alreadyPending = await prisma.payment.findFirst({
    where: { invoiceId: invoice.id, status: "PENDING", recordedById: session.user.id },
  });
  if (!alreadyPending) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: outstanding,
        method: method as PaymentMethod,
        reference,
        note: `Milestone payment — ${m.project.refNo} · ${m.title}`,
        recordedById: session.user.id,
      },
    });
  }
  await notify({
    toUserId: m.project.providerUserId,
    subject: `${m.project.refNo}: milestone payment reported`,
    body: `The customer reported payment for "${m.title}" (PKR ${outstanding.toLocaleString()}). Syntax verifies receipt into the platform account — the milestone settles once confirmed. Track it under Billing.`,
    href: "/lab/billing",
  });
  // escrow — admin must verify the money landed in the Syntax account
  await notifyAllAdmins(
    `Milestone payment to verify: ${m.project.refNo}`,
    `${m.project.refNo} · "${m.title}" — customer reported PKR ${outstanding.toLocaleString()}. Confirm receipt in Finance to release the milestone.`,
    "/admin/finance"
  );
  await audit(session.user.id, "MILESTONE_PAYMENT_REPORTED", "Milestone", milestoneId, `${m.project.refNo} · ${m.title}`);
  revalidatePath(`/dashboard/projects/${m.projectId}`);
  revalidatePath(`/lab/projects/${m.projectId}`);
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
}

// ---------- reviews ----------

export async function submitReview(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") redirect("/login");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.customerId !== session.user.id) throw new Error("Not your project");
  if (project.status !== "COMPLETED") throw new Error("Only completed projects can be reviewed");
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating"))));
  await prisma.review.upsert({
    where: { projectId },
    update: { rating, comment: String(formData.get("comment") || "") || null },
    create: {
      projectId,
      customerId: session.user.id,
      providerId: project.providerId,
      rating,
      comment: String(formData.get("comment") || "") || null,
    },
  });
  await notify({ toUserId: project.providerUserId, subject: `${project.refNo}: customer review`, body: `The customer rated your work ${rating}/5.`, href: `/lab` });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

// ---------- subscription renewal ----------

export async function requestRenewal() {
  const session = await getSession();
  if (!session || !["CUSTOMER", "PROVIDER", "SUPPLIER"].includes(session.user.role ?? "")) redirect("/login");
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub) throw new Error("No subscription");
  await prisma.subscription.update({ where: { id: sub.id }, data: { renewRequestedAt: new Date() } });
  // notify admins
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  for (const a of admins) {
    await notify({ toUserId: a.id, subject: "Subscription renewal requested", body: `${session.user.name} (${session.user.email}) requested renewal of the ${sub.plan} plan.`, href: "/admin/subscriptions" });
  }
  await audit(session.user.id, "RENEWAL_REQUESTED", "Subscription", sub.id, sub.plan);
  revalidatePath("/dashboard/profile");
  revalidatePath("/lab/profile");
  revalidatePath("/supplier");
}
