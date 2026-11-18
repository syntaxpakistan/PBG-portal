export const PLANS = {
  BASIC: {
    price: 50000,
    termYears: 1,
    label: "Basic",
    tagline: "For facilities starting on the Gateway",
    features: [
      "Verified listing in the national registry",
      "Sealed quotes on routed RFQs",
      "Project messaging & document exchange",
      "Result delivery through Gateway",
    ],
  },
  PRO: {
    price: 144000,
    termYears: 3,
    label: "Pro",
    tagline: "For established labs & suppliers",
    features: [
      "Everything in the previous plan, plus:",
      "Priority routing on matched RFQs",
      "Featured badge in the registry",
      "Quote & project analytics",
    ],
  },
  CUSTOM: {
    price: 240000,
    termYears: 5,
    label: "Elite",
    tagline: "For high-capacity & HPC providers",
    features: [
      "Everything in the previous plan, plus:",
      "Dedicated Gateway account manager",
      "HPC / bulk-capacity showcase",
      "Priority support & custom integrations",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// same plan, supplier-relevant wording, the plan pickers show these instead
// of the lab-centric feature list when the registrant is a supplier
export const SUPPLIER_FEATURES: Record<PlanKey, string[]> = {
  BASIC: [
    "Verified listing in the national registry",
    "Product catalogue on the moderated marketplace",
    "Direct buyer enquiries & order offers",
    "Escrow-protected payment collection",
  ],
  PRO: [
    "Everything in the previous plan, plus:",
    "Featured badge on your storefront",
    "Higher placement in the supplies catalogue",
    "Enquiry & sales analytics",
  ],
  CUSTOM: [
    "Everything in the previous plan, plus:",
    "Dedicated Gateway account manager",
    "Bulk-catalogue & brand showcase",
    "Priority support & custom integrations",
  ],
};

export const planTermLabel = (key: PlanKey) =>
  `${PLANS[key].termYears} year${PLANS[key].termYears > 1 ? "s" : ""}`;

export const planTermMs = (key: PlanKey) => PLANS[key].termYears * 365 * 864e5;

// what each plan actually unlocks, enforced in lib/entitlements.ts + actions
export const PLAN_FLAGS: Record<PlanKey, {
  priorityRouting: boolean;   // PRO+ see every capability-matched RFQ, not just text matches
  featuredBadge: boolean;     // highlighted in the public registry
  analytics: boolean;         // /lab/analytics dashboard
  dedicatedManager: boolean;  // ELITE, named Gateway contact
}> = {
  BASIC: { priorityRouting: false, featuredBadge: false, analytics: false, dedicatedManager: false },
  PRO: { priorityRouting: true, featuredBadge: true, analytics: true, dedicatedManager: false },
  CUSTOM: { priorityRouting: true, featuredBadge: true, analytics: true, dedicatedManager: true },
};

export const GRACE_DAYS = 7; // paid-through expiry + grace before lockdown

export const ORG_TYPES = [
  "University",
  "Hospital / Clinical",
  "Research Institute",
  "Agri / Livestock",
  "Pharma / Industry",
  "Individual researcher",
];
