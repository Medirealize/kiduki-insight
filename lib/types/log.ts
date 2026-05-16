import type { PersonalityGroup } from "@/lib/personality";

export type DiagnosisLog = {
  id: string;
  createdAt: string;
  group: PersonalityGroup;
  userInput: string;
  insight: string;
  doctorAdvice: string;
  selectedQuestions: string[];
};

export type UserStatus = "FREE" | "PREMIUM";

export type UserState = {
  status: UserStatus;
  dailyUsage: number;
  dailyUsageDate: string;
};

export const FREE_LOG_VISIBLE = 3;
export const FREE_DAILY_LIMIT = 3;
