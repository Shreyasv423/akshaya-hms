import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabase";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import PatientList from "./modules/patients/PatientList";
import OpdDashboard from "./modules/opd/OpdDashboard";
import IpdDashboard from "./modules/ipd/IpdDashboard";
import DischargeDashboard from "./modules/discharge/DischargeDashboard";
import AdminDashboard from "./modules/admin/AdminDashboard";
import BillingSettings from "./modules/admin/BillingSettings";
import Login from "./auth/Login";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string>("reception");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        setRole(profile?.role || "reception");
      }
    };

    initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={layoutWrapper}>
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main-content" style={contentStyle}>
          <Routes>

            <Route
              path="/"
              element={
                role === "admin"
                  ? <Navigate to="/admin" />
                  : role === "doctor"
                  ? <Navigate to="/opd" />
                  : <Navigate to="/patients" />
              }
            />

            {role === "admin" && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/billing-settings" element={<BillingSettings />} />
                <Route path="/ipd" element={<IpdDashboard />} />
                <Route path="/discharge" element={<DischargeDashboard />} />
              </>
            )}

            {(role === "admin" || role === "reception") && (
              <>
                <Route path="/patients" element={<PatientList />} />
                <Route path="/opd" element={<OpdDashboard />} />
              </>
            )}

            {role === "doctor" && (
              <Route path="/opd" element={<OpdDashboard />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

/* Layout Styles */

const layoutWrapper = {
  display: "flex",
  minHeight: "calc(100vh - 80px)",
  background: "#f8fafc"
};

const contentStyle = {
  flex: 1,
  padding: 20,
  marginLeft: 260,
  transition: "margin 0.3s ease"
};