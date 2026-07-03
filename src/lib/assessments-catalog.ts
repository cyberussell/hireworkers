import type { CandidateCategory } from "@/types/candidate";

export interface TypingAssessmentDef {
  kind: "typing";
  id: string;
  title: string;
  durationSeconds: number;
  passage: string;
}

export const TYPING_ASSESSMENT: TypingAssessmentDef = {
  kind: "typing",
  id: "typing-speed",
  title: "Typing Speed Test",
  durationSeconds: 60,
  passage:
    "Thank you for reaching out. I understand this is frustrating, and I want to help you resolve it as quickly as possible. Could you share your order number so I can look into what happened? Once I have that, I will check the details and get back to you with a clear next step. Your patience is appreciated while we sort this out together.",
};

// Typing speed is only a meaningful signal for desk/typing-heavy work — a
// carpenter or caregiver shouldn't be shown a customer-service typing test.
export const TYPING_RELEVANT_CATEGORIES: CandidateCategory[] = [
  "virtual_assistant",
  "customer_support",
  "bookkeeper",
  "sales_representative",
  "general_professional",
];
