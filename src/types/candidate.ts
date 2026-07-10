export type CandidateCategory =
  | "virtual_assistant"
  | "customer_support"
  | "bubble_developer"
  | "graphic_designer"
  | "bookkeeper"
  | "sales_representative"
  | "skilled_trade"
  | "caregiving_domestic"
  | "general_professional";

export const CANDIDATE_CATEGORY_LABELS: Record<CandidateCategory, string> = {
  virtual_assistant: "Virtual Assistant",
  customer_support: "Customer Support",
  bubble_developer: "Bubble.io Developer",
  graphic_designer: "Graphic Designer",
  bookkeeper: "Bookkeeper",
  sales_representative: "Sales Representative",
  skilled_trade: "Skilled Trade",
  caregiving_domestic: "Caregiving & Domestic Work",
  general_professional: "Professional",
};

export type Availability =
  | "immediately"
  | "within_2_weeks"
  | "within_month"
  | "not_available";

export type GovernmentIdType =
  | "national_id"
  | "sss"
  | "drivers_license"
  | "senior_citizen_id"
  | "school_id"
  | "other";

export const GOVERNMENT_ID_TYPE_LABELS: Record<GovernmentIdType, string> = {
  national_id: "National ID (PhilSys)",
  sss: "SSS ID",
  drivers_license: "Driver's License",
  senior_citizen_id: "Senior Citizen ID",
  school_id: "School ID",
  other: "Other government ID",
};

export type PaymentMethod =
  | "gcash"
  | "cash"
  | "bank_transfer"
  | "money_transfer"
  | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  gcash: "GCash",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  money_transfer: "Money Transfer (e.g. padala)",
  other: "Other",
};

export interface Candidate {
  id: string;
  name: string;
  professionalTitle: string;
  category: CandidateCategory;
  avatarSeed: string;
  professionalSummary: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  aiSkillsTags: string[];
  languages: {
    name: string;
    proficiency: "native" | "fluent" | "conversational";
  }[];

  verified: {
    identity: boolean;
    email: boolean;
    phone: boolean;
  };

  portfolio: {
    title: string;
    description: string;
    url?: string;
  }[];

  workHistory: {
    role: string;
    client: string;
    duration: string;
    description: string;
  }[];

  certifications: {
    name: string;
    issuer: string;
    year: number;
  }[];

  assessments: {
    typingSpeedWpm?: number;
    communicationScore?: number;
    skillAssessments: { name: string; score: number; maxScore: number }[];
  };

  availability: Availability;
  hoursPerWeek: "full_time" | "part_time" | "flexible";
  lastActive: string;
  responseRate: number;
  responseTimeHours: number;

  references: {
    name: string;
    role: string;
    relationship: string;
    quote: string;
  }[];

  featured?: boolean;
  /** True for profiles a job seeker built themselves via /work — no track
   * record yet, so response rate/time are not shown as real stats. */
  selfSubmitted?: boolean;
  /** Only present on self-submitted profiles. Shown directly on the
   * passport page — there's no accounts/gating system yet, so this is
   * visible to anyone viewing the profile. */
  contactDetails?: string;
  /** Only present on self-submitted profiles — collected during onboarding
   * so employers/AI matching can consider proximity. Not shown publicly. */
  address?: string;
  /** How many times this profile has been viewed on its public passport
   * page, shown back to the owner on their dashboard. */
  profileViews?: number;
  /** "daily" if dailyRate is set, "contract" if paid per project, or
   * "not_specified" if pay wasn't discussed during onboarding. */
  rateType?: "daily" | "contract" | "not_specified";
  /** PHP amount per day — only meaningful when rateType is "daily". An
   * hourly rate is derived from this (÷8) wherever it's displayed, not
   * stored separately. */
  dailyRate?: number;
  /** Defaults to the Google/Facebook profile photo at signup; can be
   * replaced with a custom upload. */
  avatarUrl?: string;
  /** False right after the AI interview auto-saves — private until the
   * person explicitly publishes it. Always true for seed/legacy profiles. */
  published?: boolean;
  /** Self-declared, filled in from the edit screen whenever the person
   * wants — NOT proof, and does not set verified.identity. That flag is
   * reserved for a future human-verifier feature; this is just a claim
   * counted toward profile completeness. */
  governmentIdType?: GovernmentIdType;
  governmentIdNumber?: string;
  /** How they'd like to be paid — shown on their profile alongside rate. */
  paymentMethods?: PaymentMethod[];
  /** Set by an AI match (once, on profile save) against trade_catalog —
   * null/undefined means either not matched yet or genuinely no close
   * match, in which case a missing_trade_requests row exists for Mission
   * Control to fill in. Never regenerated on every dashboard view. */
  tradeSlug?: string;
}
