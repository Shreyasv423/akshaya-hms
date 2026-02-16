import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import PatientList from "./modules/patients/PatientList";
import OpdDashboard from "./modules/opd/OpdDashboard";
import IpdDashboard from "./modules/ipd/IpdDashboard";
import DischargeDashboard from "./modules/discharge/DischargeDashboard";
import AdminDashboard from "./modules/admin/AdminDashboard";
import Login from "./auth/Login";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
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

    init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
 

      <Navbar />

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 120px)",
          background: "#f0f9ff"
        }}
      >
        <Sidebar role={role || "reception"} />

        <div
          style={{
            flex: 1,
            padding: 30,
            overflowY: "auto"
          }}
        >
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
              <Route path="/admin" element={<AdminDashboard />} />
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

            {role === "admin" && (
              <>
                <Route path="/ipd" element={<IpdDashboard />} />
                <Route path="/discharge" element={<DischargeDashboard />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
