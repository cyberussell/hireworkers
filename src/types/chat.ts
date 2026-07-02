export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export type HireStatus =
  | "idle"
  | "streaming"
  | "ai_unavailable"
  | "rate_limited"
  | "error";
