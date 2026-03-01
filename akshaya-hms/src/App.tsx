import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabase";
import "./App.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import FrontDeskDashboard from "./modules/frontdesk/FrontDeskDashboard";
import OpdDashboard from "./modules/opd/OpdDashboard";
import IpdDashboard from "./modules/ipd/IpdDashboard";
import DischargeDashboard from "./modules/discharge/DischargeDashboard";
import AdminDashboard from "./modules/admin/AdminDashboard";
import BillingSettings from "./modules/admin/BillingSettings";
import Login from "./auth/Login";

import HrDashboard from "./modules/hr/HrDashboard";
import IcuDashboard from "./modules/icu/IcuDashboard";
import LabDashboard from "./modules/lab/LabDashboard";
import PharmacyDashboard from "./modules/pharmacy/PharmacyDashboard";
import BedManagement from "./modules/ipd/BedManagement";
import BillingDashboard from "./modules/billing/BillingDashboard";

const SIDEBAR_WIDTH = 260;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string>("reception");
  // null = not yet checked; false = no session; true = has session
  const [initialised, setInitialised] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  /* ---------- Resize ---------- */
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------- Auth ---------- */
  useEffect(() => {
    // Get initial session synchronously from local storage
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) {
        setInitialised(true);
        return;
      }
      // Fetch role — if this fails for any reason, fall back gracefully
      supabase
        .from("profiles")
        .select("role")
        .eq("id", s.user.id)
        .single()
        .then(
          ({ data }) => {
            if (data?.role) setRole(data.role);
            setInitialised(true);
          },
          () => {
            setInitialised(true);
          }
        );
    });

    // Listen for future sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        if (event === "SIGNED_OUT") {
          setSession(null);
          setRole("reception");
        } else if (event === "SIGNED_IN" && s) {
          setSession(s);
          supabase
            .from("profiles")
            .select("role")
            .eq("id", s.user.id)
            .single()
            .then(
              ({ data }) => {
                if (data?.role) setRole(data.role);
                setInitialised(true);
              },
              () => {
                setInitialised(true);
              }
            );
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* ---------- Still initialising ---------- */
  if (!initialised) {
    return (
      <div style={loadingScreen}>
        <div style={spinner} />
      </div>
    );
  }

  /* ---------- Not logged in ---------- */
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  /* ---------- Main app ---------- */
  const toggleSidebar = () => setSidebarOpen(p => !p);

  return (
    <BrowserRouter>
      <Navbar toggleSidebar={toggleSidebar} />

      <div style={{ display: "flex", minHeight: "calc(100vh - 80px)", background: "#f8fafc" }}>
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          isMobile={isMobile}
          onClose={() => isMobile && setSidebarOpen(false)}
        />

        <main
          className="main-content"
          style={{
            flex: 1,
            padding: isMobile ? 12 : 24,
            marginLeft: !isMobile && sidebarOpen ? SIDEBAR_WIDTH : 0,
            transition: "margin-left 0.3s ease",
            minWidth: 0,
            overflowX: "hidden"
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                role === "admin"
                  ? <Navigate to="/admin" replace />
                  : role === "doctor"
                    ? <Navigate to="/opd" replace />
                    : <Navigate to="/front-desk" replace />
              }
            />

            {role === "admin" && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/billing" element={<BillingDashboard />} />
                <Route path="/billing-settings" element={<BillingSettings />} />
                <Route path="/ipd" element={<IpdDashboard />} />
                <Route path="/discharge" element={<DischargeDashboard />} />
                <Route path="/hr" element={<HrDashboard />} />
                <Route path="/icu" element={<IcuDashboard />} />
                <Route path="/lab" element={<LabDashboard />} />
                <Route path="/pharmacy" element={<PharmacyDashboard />} />
                <Route path="/beds" element={<BedManagement />} />
              </>
            )}

            {(role === "admin" || role === "reception") && (
              <>
                <Route path="/front-desk" element={<FrontDeskDashboard />} />
                <Route path="/billing" element={<BillingDashboard />} />
              </>
            )}

            {role === "doctor" && (
              <Route path="/opd" element={<OpdDashboard />} />
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const loadingScreen: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "#f8fafc"
};

const spinner: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #0ea5e9",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};