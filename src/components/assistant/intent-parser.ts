import type { ParsedAssistantIntent } from "./types";

export function parseAssistantIntent(input: string): ParsedAssistantIntent {
  const query = input.trim().toLowerCase();

  // 1. Task Creation intent
  const createMatch = input.match(
    /(?:create|add|new)\s+(?:task|item|ticket|issue)?(?::|\s+)?(.+)/i,
  );
  if (createMatch) {
    const rawContent = createMatch[1].trim();
    let priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM";
    let title = rawContent;

    if (/urgent|critical|p0|asap/i.test(rawContent)) {
      priority = "URGENT";
      title = title.replace(/\b(urgent|critical|p0|asap)\b/gi, "").trim();
    } else if (/high|p1|important/i.test(rawContent)) {
      priority = "HIGH";
      title = title.replace(/\b(high|p1|important)\b/gi, "").trim();
    } else if (/low|p3|minor/i.test(rawContent)) {
      priority = "LOW";
      title = title.replace(/\b(low|p3|minor)\b/gi, "").trim();
    }

    return {
      type: "CREATE_TASK",
      confidence: 0.95,
      params: {
        taskTitle: title || "New task",
        taskPriority: priority,
      },
      summary: `Prepared draft task "${title || "New task"}" with ${priority} priority.`,
    };
  }

  // 2. Sprint / Project Summary intent
  if (
    /summar(?:y|ize)|sprint\s+status|progress\s+report|how\s+(?:are\s+we\s+doing|is\s+the\s+project)/i.test(
      query,
    )
  ) {
    return {
      type: "SUMMARIZE_SPRINT",
      confidence: 0.9,
      params: {},
      summary: "Generated real-time sprint delivery summary and velocity telemetry.",
    };
  }

  // 3. Project Health / Blocker analysis
  if (/health|risk|blocker|delay|bottleneck|stale|stuck|behind\s+schedule/i.test(query)) {
    return {
      type: "PROJECT_HEALTH",
      confidence: 0.88,
      params: {},
      summary: "Analyzed project delivery risks, overdue bottlenecks, and stability indicators.",
    };
  }

  // 4. Task Filtering intent
  if (
    /overdue|late|past\s+due/i.test(query) ||
    /filter|show|find|list\s+(?:urgent|high|todo|done|in\s+progress)/i.test(query)
  ) {
    const isOverdue = /overdue|late|past\s+due/i.test(query);
    let priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    let status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | undefined;

    if (/urgent/i.test(query)) priority = "URGENT";
    else if (/high/i.test(query)) priority = "HIGH";
    else if (/medium/i.test(query)) priority = "MEDIUM";
    else if (/low/i.test(query)) priority = "LOW";

    if (/todo|backlog/i.test(query)) status = "TODO";
    else if (/in\s+progress|active/i.test(query)) status = "IN_PROGRESS";
    else if (/review/i.test(query)) status = "REVIEW";
    else if (/done|completed/i.test(query)) status = "DONE";

    return {
      type: "FILTER_TASKS",
      confidence: 0.85,
      params: {
        isOverdue,
        priority,
        status,
        query: input,
      },
      summary: `Filtered tasks by: ${
        [isOverdue && "Overdue", priority && `${priority} Priority`, status && `${status} Status`]
          .filter(Boolean)
          .join(", ") || "Active criteria"
      }.`,
    };
  }

  // Fallback General Query
  return {
    type: "GENERAL_QUERY",
    confidence: 0.6,
    params: { query: input },
    summary: "Queried OrbitPM workspace intelligence.",
  };
}
