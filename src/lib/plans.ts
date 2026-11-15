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
      "Result delivery through Syntax",
    ],
  },
  PRO: {
    price: 148000,
    termYears: 3,
    label: "Pro",
    tagline: "For established labs & suppliers",
    features: [
      "Everything in Basic",
      "Priority routing on matched RFQs",
      "Featured badge in the registry",
      "Quote & project analytics",
    ],
  },
  CUSTOM: {
    price: 246000,
    termYears: 5,
    label: "Custom",
    tagline: "For high-capacity & HPC providers",
    features: [
      "Everything in Pro",
      "Dedicated Syntax account manager",
      "HPC / bulk-capacity showcase",
      "Priority support & custom integrations",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const planTermLabel = (key: PlanKey) =>
  `${PLANS[key].termYears} year${PLANS[key].termYears > 1 ? "s" : ""}`;

export const planTermMs = (key: PlanKey) => PLANS[key].termYears * 365 * 864e5;

// what each plan actually unlocks — enforced in lib/entitlements.ts + actions
export const PLAN_FLAGS: Record<PlanKey, {
  priorityRouting: boolean;   // PRO+ see every capability-matched RFQ, not just text matches
  featuredBadge: boolean;     // highlighted in the public registry
  analytics: boolean;         // /lab/analytics dashboard
  dedicatedManager: boolean;  // CUSTOM — named Syntax contact
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
