import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/lib/cartContext";
import { MimenuProvider } from "@/lib/mimenuContext";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { queueManager } from "@/integrations/whatsapp/queue-manager";
import LoadingFallback from "@/components/LoadingFallback";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load customer pages
const QRLanding = lazy(() => import("./pages/customer/QRLanding"));
const Menu = lazy(() => import("./pages/customer/Menu"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const CheckoutLegacy = lazy(() => import("./pages/customer/CheckoutLegacy"));
const Payment = lazy(() => import("./pages/customer/Payment"));
const OrderStatus = lazy(() => import("./pages/customer/OrderStatus"));

// Lazy load admin pages
const Admin = lazy(() => import("./pages/admin/Admin"));
const AdminAIChat = lazy(() => import("./pages/admin/AdminAIChat"));
const AdminMenuIngester = lazy(() => import("./pages/admin/AdminMenuIngester"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminTables = lazy(() => import("./pages/admin/AdminTables"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminWaiterReportsPage = lazy(() => import("./pages/admin/AdminWaiterReportsPage"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const WhatsAppAdmin = lazy(() => import("./pages/admin/WhatsAppAdmin"));
const CustomerManagement = lazy(() => import("./pages/admin/CustomerManagement"));
const PrintServerConfig = lazy(() => import("./pages/admin/PrintServerConfig"));

// Lazy load staff pages
const Cashier = lazy(() => import("./pages/staff/Cashier"));

// Lazy load waiter pages
const Waiter = lazy(() => import("./pages/waiter/Waiter"));
const WaiterDashboard = lazy(() => import("./pages/waiter/WaiterDashboard"));
const WaiterSetup = lazy(() => import("./pages/waiter/WaiterSetup"));
const WaiterManagement = lazy(() => import("./pages/waiter/WaiterManagement"));
const WaiterDiagnostic = lazy(() => import("./pages/waiter/WaiterDiagnostic"));

// Lazy load public pages
const LandingTakeat = lazy(() => import("./pages/public/LandingTakeat"));
const Landing = lazy(() => import("./pages/public/Landing"));
const LandingGenio = lazy(() => import("./pages/public/LandingGenio"));
const Onboarding = lazy(() => import("./pages/public/Onboarding"));
const LandingMenu = lazy(() => import("./pages/public/LandingMenu"));
const Proposta = lazy(() => import("./pages/public/Proposta"));
const ContractManagement = lazy(() => import("./pages/public/ContractManagement"));
const Auth = lazy(() => import("./pages/public/Auth"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Lazy load debug pages
const OrderLookup = lazy(() => import("./pages/debug/OrderLookup"));
const QRRedirect = lazy(() => import("./pages/debug/QRRedirect"));
const MenuDebug = lazy(() => import("./pages/debug/MenuDebug"));
const PaymentDebug = lazy(() => import("./pages/debug/PaymentDebug"));
const CreditCardDebug = lazy(() => import("./pages/debug/CreditCardDebug"));
const CardPaymentTest = lazy(() => import("./pages/debug/CardPaymentTest"));
const PaymentTest = lazy(() => import("./pages/debug/PaymentTest"));
const Monitoring = lazy(() => import("./pages/debug/Monitoring"));
const SystemDiagnostic = lazy(() => import("./pages/debug/SystemDiagnostic"));

const queryClient = new QueryClient();

const App = () => {
  // Initialize WhatsApp notification queue processing
  useEffect(() => {
    console.log('Starting WhatsApp notification queue auto-processing...');
    queueManager.startAutoProcessing();
    
    return () => {
      console.log('Stopping WhatsApp notification queue auto-processing...');
      queueManager.stopAutoProcessing();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MimenuProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public & SEO Landing */}
                  <Route path="/" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingTakeat />
                    </Suspense>
                  } />
                  <Route path="/cardapio-digital" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingTakeat />
                    </Suspense>
                  } />
                  <Route path="/saas" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingTakeat />
                    </Suspense>
                  } />
                  <Route path="/takeat" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingTakeat />
                    </Suspense>
                  } />
                  <Route path="/landing-genio" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingGenio />
                    </Suspense>
                  } />
                  <Route path="/old" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingGenio />
                    </Suspense>
                  } />
                  <Route path="/onboarding" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Onboarding />
                    </Suspense>
                  } />
                  <Route path="/landing-menu" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LandingMenu />
                    </Suspense>
                  } />
                  <Route path="/proposta" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Proposta />
                    </Suspense>
                  } />
                  <Route path="/contract-management" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ContractManagement />
                    </Suspense>
                  } />

                  {/* Customer Menu & Ordering */}
                  <Route path="/menu" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Menu />
                    </Suspense>
                  } />
                  <Route path="/checkout" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Checkout />
                    </Suspense>
                  } />
                  <Route path="/checkout2" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CheckoutLegacy />
                    </Suspense>
                  } />
                  <Route path="/payment/:orderId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Payment />
                    </Suspense>
                  } />
                  <Route path="/order-status/:orderId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OrderStatus />
                    </Suspense>
                  } />
                  <Route path="/order/:orderId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OrderStatus />
                    </Suspense>
                  } />
                  <Route path="/order-lookup" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <OrderLookup />
                    </Suspense>
                  } />
                  <Route path="/auth" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Auth />
                    </Suspense>
                  } />

                  {/* Staff & Waiter routes */}
                  <Route path="/waiter" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Waiter />
                    </Suspense>
                  } />
                  <Route path="/waiter/setup" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WaiterSetup />
                    </Suspense>
                  } />
                  <Route path="/waiter/dashboard" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WaiterDashboard />
                    </Suspense>
                  } />
                  <Route path="/waiter-dashboard" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WaiterDashboard />
                    </Suspense>
                  } />
                  <Route path="/kitchen" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Cashier />
                    </Suspense>
                  } />
                  <Route path="/cashier" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Cashier />
                    </Suspense>
                  } />

                  {/* Admin Command Center & AI Copilot Routes */}
                  <Route path="/admin" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Admin />
                    </Suspense>
                  } />
                  <Route path="/admin/ai" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminAIChat />
                    </Suspense>
                  } />
                  <Route path="/admin/ingester" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminMenuIngester />
                    </Suspense>
                  } />
                  <Route path="/admin/ingest-menu" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminMenuIngester />
                    </Suspense>
                  } />
                  <Route path="/admin/offers" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminOffers />
                    </Suspense>
                  } />
                  <Route path="/admin/analytics" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminAnalytics />
                    </Suspense>
                  } />
                  <Route path="/admin/tables" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminTables />
                    </Suspense>
                  } />
                  <Route path="/admin/reviews" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminReviews />
                    </Suspense>
                  } />
                  <Route path="/admin/branding" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminBranding />
                    </Suspense>
                  } />
                  <Route path="/admin/products" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminProducts />
                    </Suspense>
                  } />
                  <Route path="/admin/settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminSettings />
                    </Suspense>
                  } />
                  <Route path="/reports" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Reports />
                    </Suspense>
                  } />
                  <Route path="/whatsapp-admin" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WhatsAppAdmin />
                    </Suspense>
                  } />
                  <Route path="/print-server-config" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PrintServerConfig />
                    </Suspense>
                  } />
                  <Route path="/monitoring" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Monitoring />
                    </Suspense>
                  } />
                  <Route path="/waiter-management" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WaiterManagement />
                    </Suspense>
                  } />
                  <Route path="/admin/waiter-reports" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminWaiterReportsPage />
                    </Suspense>
                  } />
                  <Route path="/customers" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CustomerManagement />
                    </Suspense>
                  } />
                  <Route path="/diagnostic" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SystemDiagnostic />
                    </Suspense>
                  } />
                  <Route path="/waiter-diagnostic" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WaiterDiagnostic />
                    </Suspense>
                  } />

                  {/* QR Code direct access route */}
                  <Route path="/:tableId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <QRRedirect />
                    </Suspense>
                  } />

                  {/* Catch-all route */}
                  <Route path="*" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <NotFound />
                    </Suspense>
                  } />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </MimenuProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
