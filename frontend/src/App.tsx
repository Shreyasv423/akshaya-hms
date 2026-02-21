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

  // If not logged in → show login only
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
      <Navbar />

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 85px)", // match navbar height
          background: "#f8fafc"
        }}
      >
        <Sidebar role={role} />

        <div
          style={{
            flex: 1,
            padding: 30,
            overflowY: "auto"
          }}
        >
          <Routes>

            {/* Default Redirect Based on Role */}
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

            {/* Admin Routes */}
            {role === "admin" && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<BillingSettings />} />
                <Route path="/ipd" element={<IpdDashboard />} />
                <Route path="/discharge" element={<DischargeDashboard />} />
              </>
            )}

            {/* Reception + Admin */}
            {(role === "admin" || role === "reception") && (
              <>
                <Route path="/patients" element={<PatientList />} />
                <Route path="/opd" element={<OpdDashboard />} />
              </>
            )}

            {/* Doctor Only */}
            {role === "doctor" && (
              <Route path="/opd" element={<OpdDashboard />} />
            )}

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}