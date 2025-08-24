import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import MyListings from "./pages/MyListings";
import MyBookings from "./pages/MyBookings";
import OwnerRegistration from "./pages/OwnerRegistration";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import { StarknetConfig, InjectedConnector, publicProvider } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";

const queryClient = new QueryClient();

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('App runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h1 style={{ color: 'red' }}>Runtime error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StarknetConfig
        autoConnect
        chains={[sepolia, mainnet]}
        provider={publicProvider()}
        connectors={[
          // Let starknet-react detect injected wallets (Argent X, Braavos)
          new InjectedConnector({ options: { id: 'argentX' } }),
          new InjectedConnector({ options: { id: 'braavos' } }),
        ]}
      >
        <AppErrorBoundary>
          <BrowserRouter>
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/owner-registration" element={<OwnerRegistration />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AppErrorBoundary>
      </StarknetConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
