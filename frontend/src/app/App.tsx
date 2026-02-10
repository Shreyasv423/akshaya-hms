import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getCurrentUserRole } from "../services/auth";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PatientList from "../modules/patients/PatientList";
import Login from "../auth/Login";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      if (data.session) getCurrentUserRole().then(setRole);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
      if (session) getCurrentUserRole().then(setRole);
      else setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!loggedIn) return <Login />;

  return (
    <>
      <Navbar />

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {role && <Sidebar role={role} />}

        <div
          style={{
            flex: 1,
            background: "var(--bg)",
            padding: 24,
            overflowY: "auto"
          }}
        >
          <PatientList />
        </div>
      </div>
    </>
  );
}
