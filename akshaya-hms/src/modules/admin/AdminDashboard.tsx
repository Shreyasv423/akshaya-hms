import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [totalPatients, setTotalPatients] = useState(0);
  const [opdToday, setOpdToday] = useState(0);
  const [ipdActive, setIpdActive] = useState(0);
  const [billsToday, setBillsToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);

  const [recentBills, setRecentBills] = useState<{ id: string; total_amount: number; created_at: string }[]>([]);
  const [recentOpd, setRecentOpd] = useState<{ id: string; patient_name: string; doctor_name: string }[]>([]);
  const [totalBeds, setTotalBeds] = useState(0);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);

  async function fetchStats() {
    const today = new Date().toISOString().split("T")[0];

    /* Total Patients */
    const { count: patientCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    /* OPD Today */
    const { data: opdData } = await supabase
      .from("opd_appointments")
      .select("*")
      .eq("visit_date", today);

    /* Active IPD */
    const { count: ipdCount } = await supabase
      .from("ipd_admissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "Admitted");

    /* Total Beds */
    const { count: bedCount } = await supabase
      .from("beds")
      .select("*", { count: "exact", head: true });

    /* Bills Today */
    const { data: billsData } = await supabase
      .from("opd_bills")
      .select("*")
      .gte("created_at", today)
      .order("created_at", { ascending: false });

    const revenue =
      billsData?.reduce(
        (sum, bill) => sum + (bill.total_amount || 0),
        0
      ) || 0;

    setTotalPatients(patientCount || 0);
    setOpdToday(opdData?.length || 0);
    setIpdActive(ipdCount || 0);
    setTotalBeds(bedCount || 0);
    setBillsToday(billsData?.length || 0);
    setRevenueToday(revenue);

    setRecentBills(billsData?.slice(0, 5) || []);
    setRecentOpd(opdData?.slice(0, 5) || []);

    // Mock chart data - dynamically aggregate from DB in production
    setRevenueData([
      { name: "Mon", revenue: 4000 },
      { name: "Tue", revenue: 3000 },
      { name: "Wed", revenue: 5000 },
      { name: "Thu", revenue: revenue > 0 ? revenue : 2000 },
      { name: "Fri", revenue: 0 },
      { name: "Sat", revenue: 0 },
      { name: "Sun", revenue: 0 },
    ]);
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const occupancyPercent =
    totalBeds > 0 ? Math.round((ipdActive / totalBeds) * 100) : 0;

  return (
    <div>
      <h2 style={headingStyle}>Admin Dashboard</h2>

      {/* Summary Cards */}
      <div style={gridStyle}>
        <StatCard title="Total Patients" value={totalPatients} />
        <StatCard title="OPD Today" value={opdToday} />
        <StatCard title="Active IPD" value={ipdActive} />
        <StatCard title="Bills Today" value={billsToday} />
        <StatCard title="Revenue Today (₹)" value={revenueToday} highlight />
        <StatCard
          title={`Bed Occupancy (${occupancyPercent}%)`}
          value={`${ipdActive}/${totalBeds}`}
          warning
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Chart Section */}
        <Section title="Revenue (Past 7 Days)">
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Recent OPD */}
        <Section title="Today's OPD Visits">
          {recentOpd.length === 0 ? (
            <p style={emptyText}>No OPD visits today.</p>
          ) : (
            recentOpd.map((visit) => (
              <Row key={visit.id}>
                {visit.patient_name} — {visit.doctor_name}
              </Row>
            ))
          )}
        </Section>
      </div>

      {/* Recent Bills */}
      <Section title="Recent Bills">
        {recentBills.length === 0 ? (
          <p style={emptyText}>No bills generated today.</p>
        ) : (
          recentBills.map((bill) => (
            <Row key={bill.id}>
              ₹{bill.total_amount}
            </Row>
          ))
        )}
      </Section>
    </div>
  );
}

/* ================= UI Components ================= */

function StatCard({
  title,
  value,
  highlight,
  warning
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        border:
          highlight
            ? "2px solid #10b981"
            : warning
            ? "2px solid #f59e0b"
            : "1px solid #e2e8f0"
      }}
    >
      <div style={{ fontSize: 14, color: "#64748b" }}>{title}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: highlight
            ? "#047857"
            : warning
            ? "#b45309"
            : "#0c4a6e"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={sectionStyle}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={rowStyle}>{children}</div>;
}

/* ================= Styles ================= */

const headingStyle = {
  marginBottom: 25,
  fontSize: 22,
  fontWeight: 700
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
  marginBottom: 40
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)"
};

const sectionStyle = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 30,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)"
};

const rowStyle = {
  padding: "8px 0",
  borderBottom: "1px solid #f1f5f9"
};

const emptyText = {
  color: "#64748b"
};