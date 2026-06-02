// Phase status configuration for the trademark workflow.
// Keep this configuration-driven so statuses can be tweaked without code edits in components.

export interface PhaseDefinition {
  number: 1 | 2 | 3 | 4;
  title: string;
  shortTitle: string;
  description: string;
  statuses: string[];
  requiresPaymentBeforeNext: boolean;
}

export const TRADEMARK_PHASES: PhaseDefinition[] = [
  {
    number: 1,
    title: "Filing & Examination",
    shortTitle: "Filing",
    description: "Initial filing and examination response",
    statuses: [
      "Filed",
      "Documents Submitted",
      "Examination Received",
      "Examination Replied",
      "Acknowledgement Received",
      "Completed",
    ],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 2,
    title: "Assignment & Approval",
    shortTitle: "Assignment",
    description: "Assigned to agent and reviewed",
    statuses: ["Assigned", "Under Review", "Approved", "Rejected", "Completed"],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 3,
    title: "Publication & Opposition",
    shortTitle: "Publication",
    description: "Journal publication, opposition handling, demand notes",
    statuses: [
      "Published",
      "Journal Number Added",
      "Opposition Received",
      "Opposition Filed",
      "Opposition Withdrawn",
      "Demand Note Received",
      "Demand Note Submitted",
      "Demand Note Pending",
      "Completed",
    ],
    requiresPaymentBeforeNext: true,
  },
  {
    number: 4,
    title: "Certificate & Dispatch",
    shortTitle: "Certificate",
    description: "Certificate issuance and delivery",
    statuses: [
      "Certificate Issued",
      "Certificate Received",
      "Certificate Dispatched",
      "Delivered",
      "Completed",
    ],
    requiresPaymentBeforeNext: false,
  },
];

export const CASE_TYPES = [
  { value: "trademark", label: "Trademark" },
  { value: "ntn", label: "NTN" },
  { value: "copyright", label: "Copyright" },
  { value: "company", label: "Company" },
] as const;

export type CaseType = (typeof CASE_TYPES)[number]["value"];

export const ASSIGNMENT_STATUSES = ["Assigned", "In Progress", "Completed", "Cancelled"];

export function getPhase(n: number): PhaseDefinition | undefined {
  return TRADEMARK_PHASES.find((p) => p.number === n);
}
