// Shared types for JSDoc annotations (checked by `npm run typecheck`, never bundled).

export type Period = "day" | "week" | "month" | "year";

export type Currency = "USD" | "EUR" | "UAH";

export type MetricKey = "income" | "expense" | "balance" | "accounts";

export type Metrics = Record<MetricKey, number> & {
  deltas: Partial<Record<MetricKey, number>>;
};

export interface ChartSeries {
  labels: string[];
  values: number[];
}

export interface Transaction {
  /** ISO date without time, e.g. "2026-04-12" */
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface DashboardData {
  metrics: Metrics;
  charts: Record<string, ChartSeries>;
  transactions: Transaction[];
}

export interface DataLoadedDetail {
  period: Period;
  data: DashboardData;
}

export interface DataErrorDetail {
  period: Period;
  error: unknown;
}

export interface PeriodChangeDetail {
  period: Period;
}

// Typed custom events of the document-level event bus
declare global {
  interface DocumentEventMap {
    "data:loaded": CustomEvent<DataLoadedDetail>;
    "data:error": CustomEvent<DataErrorDetail>;
    "period:change": CustomEvent<PeriodChangeDetail>;
  }
}
