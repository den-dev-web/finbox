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

export interface MonthTotal {
  /** "YYYY-MM" */
  month: string;
  income: number;
  expense: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface ReportsData {
  months: MonthTotal[];
  categories: CategoryTotal[];
}

export type AccountType = "bank" | "savings" | "card" | "investment" | "cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Bank or broker; empty for cash */
  institution: string;
  /** In USD; negative for card debt */
  balance: number;
}

export interface AccountsData {
  accounts: Account[];
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
    /** The store started loading a period (initial load, period change, retry) */
    "data:loading": CustomEvent<PeriodChangeDetail>;
    /** A widget asks the store to reload the current period */
    "data:retry": CustomEvent<null>;
  }
}
