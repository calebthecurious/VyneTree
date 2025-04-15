import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Network from "@/pages/Network";
import Calendar from "@/pages/Calendar";
import Messages from "@/pages/Messages";
import Contacts from "@/pages/Contacts";
import Nudges from "@/pages/Nudges";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <div className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Network} />
            <Route path="/network" component={Network} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/messages" component={Messages} />
            <Route path="/contacts" component={Contacts} />
            <Route path="/nudges" component={Nudges} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
