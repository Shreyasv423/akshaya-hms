import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";

export type Appointment = {
  id: string;
  patient_id: string;
  token_number: number;
  patient_name: string;
  age: number;
  phone: string;
  doctor_name: string;
  status: string;
  visit_date: string;
};

export default function OpdDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchAppointments = async () => {
    setLoading(true);

    // Bug fix: filter by today's date so token numbers reset daily
    const { data, error } = await supabase
      .from("opd_appointments")
      .select("*")
      .eq("visit_date", today)
      .order("token_number", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const todayCount = appointments.length;
  const waitingCount = appointments.filter(a => a.status === "Waiting").length;
  const consultingCount = appointments.filter(a => a.status === "In Consultation").length;
  const completedCount = appointments.filter(a => a.status === "Completed").length;

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div style={pageContainer}>
      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: "#0c4a6e" }}>
            OPD Dashboard
          </h2>
          <p style={subText}>{formattedDate}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={summaryGrid}>
        <div style={{ ...card, borderTop: "3px solid #0ea5e9" }}>
          <h4 style={cardTitle}>Total Appointments</h4>
          <p style={cardValue}>{todayCount}</p>
        </div>

        <div style={{ ...card, borderTop: "3px solid #f59e0b" }}>
          <h4 style={cardTitle}>Waiting</h4>
          <p style={{ ...cardValue, color: "#b45309" }}>{waitingCount}</p>
        </div>

        <div style={{ ...card, borderTop: "3px solid #8b5cf6" }}>
          <h4 style={cardTitle}>In Consultation</h4>
          <p style={{ ...cardValue, color: "#6d28d9" }}>{consultingCount}</p>
        </div>

        <div style={{ ...card, borderTop: "3px solid #10b981" }}>
          <h4 style={cardTitle}>Completed</h4>
          <p style={{ ...cardValue, color: "#166534" }}>{completedCount}</p>
        </div>
      </div>

      {/* Appointment Form */}
      <div style={{ marginBottom: 30 }}>
        <AppointmentForm onSuccess={fetchAppointments} />
      </div>

      {/* Appointment List */}
      {loading ? (
        <div style={loadingStyle}>⏳ Loading appointments...</div>
      ) : (
        <AppointmentList
          appointments={appointments}
          refresh={fetchAppointments}
        />
      )}
    </div>
  );
}

/* ================= Styles ================= */

const pageContainer: React.CSSProperties = {
  padding: 4
};

const header: React.CSSProperties = {
  marginBottom: 24
};

const subText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  marginTop: 4
};

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 16,
  marginBottom: 28
};

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 12,
  padding: "18px 20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const cardTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
  fontWeight: 500
};

const cardValue: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  color: "#0c4a6e",
  margin: 0
};

const loadingStyle: React.CSSProperties = {
  padding: 20,
  color: "#64748b",
  fontSize: 14
};