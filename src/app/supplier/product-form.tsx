"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, EyeOff, Eye, ExternalLink, Trash2 } from "lucide-react";
import { addProduct, updateProduct, setProductActive, deleteProduct } from "./actions";
import { ProductImage } from "@/components/marketplace/product-image";
import { toast } from "sonner";

export type SupplierProduct = {
  id: string;
  prodNo: string;
  name: string;
  category: string;
  spec: string | null;
  description: string | null;
  brand: string | null;
  catalogNo: string | null;
  price: number | null;
  unit: string | null;
  stockStatus: string;
  leadTimeDays: number | null;
  imageKey: string | null;
  datasheetKey: string | null;
  moderation: string;
  moderationNote: string | null;
  active: boolean;
};

export function ProductForm({ product }: { product?: SupplierProduct }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const editing = !!product;
  const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-navy-3";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (editing) await updateProduct(product.id, new FormData(e.currentTarget));
          else {
            await addProduct(new FormData(e.currentTarget));
            (e.target as HTMLFormElement).reset();
          }
          toast.success(
            editing
              ? "Product updated — content changes go through a quick review before going live."
              : "Product submitted — it goes live after a quick review by the Gateway team."
          );
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="space-y-3"
    >
      <input name="name" required defaultValue={product?.name} placeholder="Product name *" className={input} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="category" required defaultValue={product?.category ?? ""} className={input}>
          <option value="">Category *</option>
          {["Reagents", "Kits", "Consumables", "Media", "Plasticware", "Equipment"].map((c) => <option key={c}>{c}</option>)}
          {editing && !["Reagents", "Kits", "Consumables", "Media", "Plasticware", "Equipment"].includes(product.category) && <option>{product.category}</option>}
        </select>
        <input name="brand" defaultValue={product?.brand ?? ""} placeholder="Brand / manufacturer" className={input} />
      </div>
      <input name="spec" defaultValue={product?.spec ?? ""} placeholder="Spec / variant (e.g. 100 rxns, 500 mL)" className={input} />
      <textarea name="description" rows={3} defaultValue={product?.description ?? ""} placeholder="Description — what it is, pack contents, storage, applications…" className={`${input} resize-y`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="price" type="number" min={0} defaultValue={product?.price ?? ""} placeholder="Price (PKR)" className={input} />
        <input name="unit" defaultValue={product?.unit ?? ""} placeholder="Unit (kit, vial, pack)" className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="catalogNo" defaultValue={product?.catalogNo ?? ""} placeholder="Catalog / SKU #" className={input} />
        <select name="stockStatus" defaultValue={product?.stockStatus ?? "IN_STOCK"} className={input}>
          <option value="IN_STOCK">In stock</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="BACKORDER">Backordered</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
        <input name="leadTimeDays" type="number" min={0} defaultValue={product?.leadTimeDays ?? ""} placeholder="Lead time (days)" className={input} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-medium text-muted">Product photo {product?.imageKey && <a href={`/api/files/${product.imageKey}?inline=1`} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">(current)</a>}</span>
          <input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="w-full text-[12px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3.5 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-yellow hover:file:bg-navy-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-medium text-muted">Datasheet / brochure (PDF) {product?.datasheetKey && <a href={`/api/files/${product.datasheetKey}?inline=1`} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">(current)</a>}</span>
          <input name="datasheet" type="file" accept="application/pdf,image/png,image/jpeg" className="w-full text-[12px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3.5 file:py-1.5 file:text-[11.5px] file:font-semibold file:text-yellow hover:file:bg-navy-2" />
        </label>
      </div>
      <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : editing ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}

const MOD_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "In review", cls: "bg-(--st-amber-bg) text-(--st-amber-fg)" },
  APPROVED: { label: "Live", cls: "bg-(--st-green-bg) text-(--st-green-fg)" },
  REJECTED: { label: "Rejected", cls: "bg-(--st-red-bg) text-(--st-red-fg)" },
};

// catalog row with expandable inline editor + hide/show + public preview
export function ProductRow({ product: p, priceLabel, stockBadge }: { product: SupplierProduct; priceLabel: React.ReactNode; stockBadge: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const mod = MOD_BADGE[p.moderation] ?? MOD_BADGE.PENDING;

  async function toggleActive() {
    setBusy(true);
    try {
      await setProductActive(p.id, !p.active);
      toast.success(p.active ? "Product hidden from the marketplace." : "Product back on the marketplace.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setBusy(false);
  }

  return (
    <div className={`px-5 py-3 ${!p.active ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {p.imageKey && (
            <ProductImage imageKey={p.imageKey} alt={p.name} className="size-11 shrink-0" imgClass="size-11 object-cover" hideExpand />
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-ink">{p.name}</div>
            <div className="text-[11.5px] text-muted">
              <span className="font-mono font-semibold">{p.prodNo}</span> · {p.category}{p.spec ? ` · ${p.spec}` : ""}{p.brand ? ` · ${p.brand}` : ""}
              {p.leadTimeDays ? ` · ${p.leadTimeDays}d lead` : ""}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${mod.cls}`}>{mod.label}</span>
              {!p.active && <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold text-muted">Hidden</span>}
              {p.moderation === "REJECTED" && p.moderationNote && <span className="text-[10.5px] text-(--st-red-fg)">{p.moderationNote}</span>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {stockBadge}
          {priceLabel}
          <button onClick={() => setOpen(!open)} className="rounded-full border border-line p-1.5 text-muted hover:bg-paper-2 hover:text-ink" title="Edit product">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={toggleActive} disabled={busy} className="rounded-full border border-line p-1.5 text-muted hover:bg-paper-2 hover:text-ink" title={p.active ? "Hide from marketplace" : "Show on marketplace"}>
            {p.active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
          <button
            onClick={async () => {
              if (!window.confirm(`Delete "${p.name}" permanently? This can't be undone.`)) return;
              setBusy(true);
              try {
                await deleteProduct(p.id);
                toast.success("Product deleted.");
                router.refresh();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed");
              }
              setBusy(false);
            }}
            disabled={busy}
            className="rounded-full border border-line p-1.5 text-muted hover:border-(--st-red-bd) hover:bg-(--st-red-bg) hover:text-(--st-red-fg)"
            title="Delete product"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {open && <div className="mt-3 rounded-lg bg-paper-2 p-4"><ProductForm product={p} /></div>}
    </div>
  );
}

export function StorefrontLink({ supplierId }: { supplierId: string }) {
  return (
    <a href={`/suppliers/${supplierId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-paper-2">
      <ExternalLink className="size-3.5" /> View my public storefront
    </a>
  );
}
