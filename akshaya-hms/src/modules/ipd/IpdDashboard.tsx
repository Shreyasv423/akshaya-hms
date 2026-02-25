import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import AdmissionForm from "./AdmissionForm";
import AdmissionList from "./AdmissionList";

export type Admission = {
  id: string;
  patient_name: string;
  age: number | null;
  gender: string;
  doctor_name: string;
  bed_number: string;
  diagnosis: string;
  status: string;
  admission_date: string;
  created_at: string;
};

export default function IpdDashboard() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ipd_admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setAdmissions(data as Admission[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const admittedCount = admissions.filter(a => a.status === "Admitted").length;
  const dischargedCount = admissions.filter(a => a.status === "Discharged").length;

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h2 style={headingStyle}>IPD Management</h2>
          <p style={subText}>Manage inpatient admissions and discharges</p>
        </div>
      </div>

      {/* Stats */}
      <div style={statsGrid}>
        <div style={{ ...statCard, borderTop: "3px solid #0ea5e9" }}>
          <div style={statLabel}>Currently Admitted</div>
          <div style={{ ...statValue, color: "#0369a1" }}>{admittedCount}</div>
        </div>
        <div style={{ ...statCard, borderTop: "3px solid #10b981" }}>
          <div style={statLabel}>Total Discharged</div>
          <div style={{ ...statValue, color: "#047857" }}>{dischargedCount}</div>
        </div>
        <div style={{ ...statCard, borderTop: "3px solid #6366f1" }}>
          <div style={statLabel}>Total Admissions</div>
          <div style={{ ...statValue, color: "#4f46e5" }}>{admissions.length}</div>
        </div>
      </div>

      {/* Admission Form */}
      <div style={{ marginBottom: 32 }}>
        <AdmissionForm onSuccess={fetchAdmissions} />
      </div>

      {/* Admission List */}
      {loading ? (
        <div style={{ color: "#64748b", fontSize: 14 }}>Loading admissions...</div>
      ) : (
        <div style={{ display: "grid", gap: 32 }}>
          <section>
            <h3 style={sectionTitle}>Active Admissions ({admittedCount})</h3>
            <AdmissionList
              admissions={admissions.filter(a => a.status === "Admitted")}
              refresh={fetchAdmissions}
            />
          </section>

          {dischargedCount > 0 && (
            <section>
              <h3 style={{ ...sectionTitle, color: "#64748b", marginTop: 24 }}>Recent Discharges</h3>
              <AdmissionList
                admissions={admissions.filter(a => a.status === "Discharged").slice(0, 5)}
                refresh={fetchAdmissions}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#0c4a6e",
  marginBottom: 16
};

const pageHeader: React.CSSProperties = {
  marginBottom: 24
};

const headingStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0c4a6e",
  marginBottom: 4
};

const subText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b"
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 16,
  marginBottom: 28
};

const statCard: React.CSSProperties = {
  background: "white",
  padding: "18px 20px",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const statLabel: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 6,
  fontWeight: 500
};

const statValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700
};