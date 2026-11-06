import { lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/lib/cartContext";
import { MimenuProvider } from "@/lib/mimenuContext";
import { AuthProvider } from "@/lib/authContext";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import LoadingFallback from "@/components/LoadingFallback";
import PlanGate from "@/components/PlanGate";
import type { Entitlement } from "@/lib/plans";

// Lazy load customer pages
const QRLanding = lazy(() => import("./pages/customer/QRLanding"));
const Menu = lazy(() => import("./pages/customer/Menu"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const Payment = lazy(() => import("./pages/customer/Payment"));
const OrderStatus = lazy(() => import("./pages/customer/OrderStatus"));

// Lazy load admin pages
const Admin = lazy(() => import("./pages/admin/Admin"));
const UpgradePlan = lazy(() => import("./pages/admin/UpgradePlan"));
const AdminAIChat = lazy(() => import("./pages/admin/AdminAIChat"));
const AdminConcierge = lazy(() => import("./pages/admin/AdminConcierge"));
const AdminConciergeSettings = lazy(() => import("./pages/admin/AdminConciergeSettings"));
const AdminMenuIngester = lazy(() => import("./pages/admin/AdminMenuIngester"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminTables = lazy(() => import("./pages/admin/AdminTables"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const CustomerManagement = lazy(() => import("./pages/admin/CustomerManagement"));
const PrintServerConfig = lazy(() => import("./pages/admin/PrintServerConfig"));

// Lazy load staff pages
const Cashier = lazy(() => import("./pages/staff/Cashier"));

// Lazy load waiter pages
const Waiter = lazy(() => import("./pages/waiter/Waiter"));
const WaiterDashboard = lazy(() => import("./pages/waiter/WaiterDashboard"));
const WaiterManagement = lazy(() => import("./pages/waiter/WaiterManagement"));

// Lazy load public pages
const LandingPlataforma = lazy(() => import("./pages/public/LandingPlataforma"));
const LandingTakeat = lazy(() => import("./pages/public/LandingTakeat"));
const Docs = lazy(() => import("./pages/public/Docs"));
const LandingARSelfHosted = lazy(() => import("./pages/public/LandingARSelfHosted"));
const Landing4DSmartMenu = lazy(() => import("./pages/public/Landing4DSmartMenu"));
const LandingMkt = lazy(() => import("./pages/public/Landing"));
const LandingGenio = lazy(() => import("./pages/public/LandingGenio"));
const LandingTakeatOld = lazy(() => import("./pages/public/LandingTakeatOld"));
const LandingClassic = lazy(() => import("./pages/public/LandingClassic"));
const LandingPontal = lazy(() => import("./pages/public/LandingPontal"));
const IndexPontal = lazy(() => import("./pages/public/IndexPontal"));
const LiveMenu = lazy(() => import("./pages/customer/LiveMenu"));
const Onboarding = lazy(() => import("./pages/public/Onboarding"));
const LandingMenu = lazy(() => import("./pages/public/LandingMenu"));
const Proposta = lazy(() => import("./pages/public/Proposta"));
const ContractManagement = lazy(() => import("./pages/public/ContractManagement"));
const Auth = lazy(() => import("./pages/public/Auth"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Lazy load debug pages
const QRRedirect = lazy(() => import("./pages/debug/QRRedirect"));

const queryClient = new QueryClient();

/** Lazy page that additionally requires a plan entitlement. */
const planPage = (feature: Entitlement, node: ReactNode) => (
  <PlanGate feature={feature}>
    <Suspense fallback={<LoadingFallback />}>{node}</Suspense>
  </PlanGate>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* BrowserRouter must wrap AuthProvider: AuthProvider calls
            useNavigate(), and any router hook outside a <Router> throws
            React Router's invariant and takes down every route. */}
        <BrowserRouter>
          <AuthProvider>
            <MimenuProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Auth route */}
                    <Route path="/auth" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Auth />
                      </Suspense>
                    } />

                    {/* Public & SEO Landing (marketing landing) */}
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
                    <Route path="/premium" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingMkt />
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
                    {/* Archived landing variants */}
                    <Route path="/old3" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingTakeatOld />
                      </Suspense>
                    } />
                    <Route path="/old4" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingClassic />
                      </Suspense>
                    } />
                    <Route path="/old5" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingPontal />
                      </Suspense>
                    } />
                    <Route path="/old6" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <IndexPontal />
                      </Suspense>
                    } />
                    <Route path="/old7" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LiveMenu />
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
                    <Route path="/plataforma" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingPlataforma />
                      </Suspense>
                    } />
                    <Route path="/docs" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Docs />
                      </Suspense>
                    } />
                    <Route path="/mi-menu-ar" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <LandingARSelfHosted />
                      </Suspense>
                    } />
                    <Route path="/new" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Landing4DSmartMenu />
                      </Suspense>
                    } />

                    {/* Customer Menu & Ordering */}
                    <Route path="/menu" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Menu />
                      </Suspense>
                    } />
                    <Route path="/:venueSlug" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Menu />
                      </Suspense>
                    } />
                    <Route path="/checkout" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Checkout />
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

                    {/* Staff & Waiter routes */}
                    <Route path="/waiter" element={planPage('waiter_app', <Waiter />)} />
                    <Route path="/waiter/dashboard" element={planPage('waiter_app', <WaiterDashboard />)} />
                    <Route path="/waiter-dashboard" element={planPage('waiter_app', <WaiterDashboard />)} />
                    <Route path="/kitchen" element={planPage('kds', <Cashier />)} />
                    <Route path="/cashier" element={planPage('kds', <Cashier />)} />

                    {/* Admin Command Center & AI Copilot Routes */}
                    <Route path="/admin" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <Admin />
                      </Suspense>
                    } />
                    <Route path="/admin/upgrade" element={
                      <Suspense fallback={<LoadingFallback />}>
                        <UpgradePlan />
                      </Suspense>
                    } />
                    <Route path="/admin/ai" element={planPage('whatsapp_concierge', <AdminAIChat />)} />
                    <Route path="/admin/concierge" element={planPage('whatsapp_concierge', <AdminConcierge />)} />
                    <Route path="/admin/concierge-settings" element={planPage('whatsapp_concierge', <AdminConciergeSettings />)} />
                    <Route path="/admin/ingester" element={planPage('photographed_menu', <AdminMenuIngester />)} />
                    <Route path="/admin/ingest-menu" element={planPage('photographed_menu', <AdminMenuIngester />)} />
                    <Route path="/admin/offers" element={planPage('smart_offers', <AdminOffers />)} />
                    <Route path="/admin/analytics" element={planPage('analytics', <AdminAnalytics />)} />
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
                    <Route path="/admin/branding" element={planPage('custom_website', <AdminBranding />)} />
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
                    <Route path="/reports" element={planPage('analytics', <Reports />)} />
                    <Route path="/print-server-config" element={planPage('printing', <PrintServerConfig />)} />
                    <Route path="/waiter-management" element={planPage('waiter_app', <WaiterManagement />)} />
                    <Route path="/admin/customers" element={planPage('crm', <CustomerManagement />)} />

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
                </TooltipProvider>
              </CartProvider>
            </MimenuProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;