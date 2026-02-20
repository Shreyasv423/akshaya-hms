import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients] = useState(0);
  const [opdToday, setOpdToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);

  async function fetchStats() {
    const today = new Date().toISOString().split("T")[0];

    // Total Patients
    const { count: patientCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    // OPD Today
    const { data: opdData } = await supabase
      .from("opd_appointments")
      .select("*")
      .eq("visit_date", today);

    // Revenue Today
    const { data: billingData } = await supabase
      .from("opd_billing")
      .select("total_amount, payment_status, created_at")
      .gte("created_at", today);

    const revenue =
      billingData
        ?.filter((b) => b.payment_status === "Paid")
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

    setTotalPatients(patientCount || 0);
    setOpdToday(opdData?.length || 0);
    setRevenueToday(revenue);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStats();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Admin Dashboard</h2>

      <div style={gridStyle}>
        <StatCard title="Total Patients" value={totalPatients} />
        <StatCard title="OPD Today" value={opdToday} />
        <StatCard title="Revenue Today (₹)" value={revenueToday} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 14, color: "#64748b" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0c4a6e" }}>
        {value}
      </div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)"
};
