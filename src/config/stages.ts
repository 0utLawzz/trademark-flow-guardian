// Stage / status configuration for the trademark workflow.
// Used across application list, detail, and timeline views.

export interface StageDefinition {
  number: 1 | 2 | 3 | 4;
  title: string;
  shortTitle: string;
  description: string;
  subStatuses: string[];
  requiresPaymentBeforeNext: boolean;
}

export const STAGES: StageDefinition[] = [
  {
    number: 1,
    title: "Filing",
    shortTitle: "Filing",
    description: "Application filed and under examination",
    subStatuses: [
      "Filing Application",
      "Documents Submitted",
      "Examination (R)",
      "Under Examination",
      "Examination Replied",
      "Acknowledged",
      "Completed",
    ],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 2,
    title: "Examination & Acceptance",
    shortTitle: "Acceptance",
    description: "Examination response, hearing, and acceptance",
    subStatuses: ["Under Examination", "Hearing", "Accepted", "Rejected", "Completed"],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 3,
    title: "Publication & Demand Note",
    shortTitle: "Publication",
    description: "Journal publication, opposition, and demand note",
    subStatuses: [
      "Journal Published",
      "Opposition Received",
      "Opposition Replied",
      "Demand Note (I)",
      "Demand Note Submitted",
      "Completed",
    ],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 4,
    title: "Certificate & Dispatch",
    shortTitle: "Certificate",
    description: "Certificate issuance and delivery",
    subStatuses: [
      "Certificate (I)",
      "Certificate Received",
      "Certificate Dispatched (TCS)",
      "Delivered",
      "Completed",
    ],
    requiresPaymentBeforeNext: false,
  },
];

export function getStage(n: number): StageDefinition | undefined {
  return STAGES.find((s) => s.number === n);
}

export const SERVICE_TYPES = [
  { value: "Trademark", label: "Trademark", path: "trademark" },
  { value: "Copyright", label: "Copyright", path: "copyright" },
  { value: "Company", label: "Company", path: "company" },
  { value: "NTN", label: "NTN / Tax Return", path: "ntn" },
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

export const CITY_CODES = ["LHR", "KHI", "ISB", "PES"] as const;

export const APPLICANT_TYPES = ["Sole Proprietor", "Company", "Partners"] as const;

export const CLIENT_PREFIXES = ["X", "A", "N"] as const;

export const ASSIGNMENT_STATUSES = ["Pending", "Accepted", "Rejected", "Cleared"] as const;

export const PAYMENT_STATUSES = ["Due", "Received", "Balance"] as const;
