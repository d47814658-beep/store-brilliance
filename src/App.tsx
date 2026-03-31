import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import PatronAuth from "./pages/PatronAuth";
import VendeurAuth from "./pages/VendeurAuth";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import ProductsPage from "./pages/dashboard/ProductsPage";
import CategoriesPage from "./pages/dashboard/CategoriesPage";
import VendeursPage from "./pages/dashboard/VendeursPage";
import SalesPage from "./pages/dashboard/SalesPage";
import StockMovementsPage from "./pages/dashboard/StockMovementsPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import CaissePage from "./pages/CaissePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedPatronRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userRole } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  if (userRole && userRole !== 'patron') return <Navigate to="/caisse" replace />;
  return <>{children}</>;
};

const ProtectedVendeurRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, userRole } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return <Navigate to="/caisse/login" replace />;
  return <>{children}</>;
};

const AuthRedirect = ({ to }: { to: string }) => {
  const { user, loading, userRole } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  if (user && userRole === 'patron') return <Navigate to="/dashboard" replace />;
  if (user && userRole === 'vendeur') return <Navigate to="/caisse" replace />;
  return to === 'patron' ? <PatronAuth /> : <VendeurAuth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect to="patron" />} />
            <Route path="/caisse/login" element={<AuthRedirect to="vendeur" />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/dashboard" element={<ProtectedPatronRoute><DashboardLayout /></ProtectedPatronRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="vendeurs" element={<VendeursPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="stock-movements" element={<StockMovementsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
            </Route>

            <Route path="/caisse" element={<ProtectedVendeurRoute><CaissePage /></ProtectedVendeurRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
