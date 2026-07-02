import type { JobBrief } from "@/types/job-brief";

export interface PostedJob {
  id: string;
  brief: JobBrief;
  postedAt: string;
}
