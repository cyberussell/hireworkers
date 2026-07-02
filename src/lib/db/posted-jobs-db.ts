import type { JobBrief } from "@/types/job-brief";
import type { PostedJob } from "@/types/posted-job";

interface PostedJobRow {
  id: string;
  title: string;
  summary: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  work_setup: string;
  schedule_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: string;
  interview_questions: string[];
  assessment_recommendations: string[];
  company_name: string;
  contact_details: string;
  status: string;
  created_at: string;
}

export function rowToPostedJob(row: PostedJobRow): PostedJob {
  return {
    id: row.id,
    postedAt: row.created_at,
    brief: {
      companyName: row.company_name,
      contactDetails: row.contact_details,
      title: row.title,
      summary: row.summary,
      responsibilities: row.responsibilities,
      requiredSkills: row.required_skills,
      preferredSkills: row.preferred_skills,
      workSetup: row.work_setup as JobBrief["workSetup"],
      scheduleType: row.schedule_type as JobBrief["scheduleType"],
      suggestedSalary: {
        min: row.salary_min ?? 0,
        max: row.salary_max ?? 0,
        currency: "PHP",
        period: row.salary_period as JobBrief["suggestedSalary"]["period"],
      },
      interviewQuestions: row.interview_questions,
      assessmentRecommendations: row.assessment_recommendations,
    },
  };
}

export function jobBriefToRow(brief: JobBrief, userId: string) {
  return {
    title: brief.title,
    summary: brief.summary,
    responsibilities: brief.responsibilities,
    required_skills: brief.requiredSkills,
    preferred_skills: brief.preferredSkills,
    work_setup: brief.workSetup,
    schedule_type: brief.scheduleType,
    salary_min: brief.suggestedSalary.min,
    salary_max: brief.suggestedSalary.max,
    salary_currency: brief.suggestedSalary.currency,
    salary_period: brief.suggestedSalary.period,
    interview_questions: brief.interviewQuestions,
    assessment_recommendations: brief.assessmentRecommendations,
    company_name: brief.companyName,
    contact_details: brief.contactDetails,
    user_id: userId,
  };
}
