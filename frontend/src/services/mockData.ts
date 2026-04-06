import { Transaction, User, CategorySpending, MonthlyTrend } from "@/types";

const categories = ["Food", "Transport", "Entertainment", "Utilities", "Salary", "Freelance", "Shopping", "Healthcare"];

export const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
  const isIncome = Math.random() > 0.6;
  return {
    id: `txn-${i + 1}`,
    description: isIncome
      ? ["Salary Payment", "Freelance Project", "Investment Return", "Bonus"][i % 4]
      : ["Grocery Shopping", "Uber Ride", "Netflix Sub", "Electric Bill", "New Shoes", "Doctor Visit"][i % 6],
    amount: isIncome ? Math.round(Math.random() * 5000 + 1000) : Math.round(Math.random() * 500 + 20),
    type: isIncome ? "income" : "expense",
    category: isIncome ? ["Salary", "Freelance"][i % 2] : categories[i % 6],
    date: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split("T")[0],
    createdBy: "admin@finance.com",
  };
});

export const mockUsers: User[] = [
  { id: "1", email: "admin@finance.com", name: "Alex Admin", role: "Admin", isActive: true, avatarTone: "purple" },
  { id: "2", email: "analyst@finance.com", name: "Anna Analyst", role: "Analyst", isActive: true, avatarTone: "blue" },
  { id: "3", email: "viewer@finance.com", name: "Victor Viewer", role: "Viewer", isActive: true, avatarTone: "green" },
  { id: "4", email: "jane@finance.com", name: "Jane Doe", role: "Viewer", isActive: false, avatarTone: "orange" },
  { id: "5", email: "bob@finance.com", name: "Bob Smith", role: "Analyst", isActive: true, avatarTone: "blue" },
];

export const mockCategorySpending: CategorySpending[] = [
  { category: "Food", amount: 3200 },
  { category: "Transport", amount: 1800 },
  { category: "Entertainment", amount: 1200 },
  { category: "Utilities", amount: 2100 },
  { category: "Shopping", amount: 2800 },
  { category: "Healthcare", amount: 900 },
];

export const mockMonthlyTrends: MonthlyTrend[] = [
  { month: "Sep", income: 98000, expense: 72000 },
  { month: "Oct", income: 112000, expense: 81000 },
  { month: "Nov", income: 105000, expense: 78000 },
  { month: "Dec", income: 138000, expense: 95000 },
  { month: "Jan", income: 118000, expense: 84000 },
  { month: "Feb", income: 77000, expense: 103000 },
  { month: "Mar", income: 194000, expense: 126100 },
];
