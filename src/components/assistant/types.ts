export type AssistantIntentType =
  | "FILTER_TASKS"
  | "SUMMARIZE_SPRINT"
  | "CREATE_TASK"
  | "PROJECT_HEALTH"
  | "GENERAL_QUERY";

export interface ParsedAssistantIntent {
  type: AssistantIntentType;
  confidence: number;
  params: {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isOverdue?: boolean;
    query?: string;
    taskTitle?: string;
    taskDescription?: string;
    taskPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
  summary: string;
}

export interface SprintSummaryData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  velocityScore: number;
  narrative: string;
  blockers: string[];
}

export interface TaskPreviewData {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
}

export interface ProjectHealthData {
  healthScore: number; // 0-100
  status: "OPTIMAL" | "HEALTHY" | "NEEDS_ATTENTION" | "CRITICAL";
  riskFactors: string[];
  recommendations: string[];
}
