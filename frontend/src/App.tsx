import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, minRole }: { children: React.ReactNode; minRole?: "Viewer" | "Analyst" | "Admin" }) {
  const { isAuthenticated, hasAccess } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (minRole && !hasAccess(minRole))
    return (
      <AppLayout>
        <ForbiddenPage />
      </AppLayout>
    );
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute minRole="Analyst"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute minRole="Admin"><UserManagementPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
