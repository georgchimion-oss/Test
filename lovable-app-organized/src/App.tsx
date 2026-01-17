import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Deliverables from "./pages/Deliverables";
import Workstreams from "./pages/Workstreams";
import OrgChart from "./pages/OrgChart";
import Team from "./pages/Team";
import Kanban from "./pages/Kanban";
import Gantt from "./pages/Gantt";
import Timesheet from "./pages/Timesheet";
import PTO from "./pages/PTO";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/deliverables" element={<Deliverables />} />
          <Route path="/workstreams" element={<Workstreams />} />
          <Route path="/org-chart" element={<OrgChart />} />
          <Route path="/team" element={<Team />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/pto" element={<PTO />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
