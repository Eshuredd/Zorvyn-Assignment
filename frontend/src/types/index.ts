export type Role = "Viewer" | "Analyst" | "Admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  /** Demo / display only — sidebar avatar color */
  avatarTone?: "green" | "blue" | "purple" | "orange";
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdBy: string;
}

export interface TransactionFilters {
  type?: "income" | "expense" | "all";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}
