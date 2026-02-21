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

  const fetchAppointments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("opd_appointments")
      .select("*")
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
  const completedCount = appointments.filter(a => a.status === "Completed").length;

  return (
    <div style={pageContainer}>
      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>OPD Dashboard</h2>
          <p style={subText}>
            Manage appointments and billing efficiently
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={summaryGrid}>
        <div style={card}>
          <h4 style={cardTitle}>Total Appointments</h4>
          <p style={cardValue}>{todayCount}</p>
        </div>

        <div style={card}>
          <h4 style={cardTitle}>Waiting</h4>
          <p style={{ ...cardValue, color: "#b45309" }}>
            {waitingCount}
          </p>
        </div>

        <div style={card}>
          <h4 style={cardTitle}>Completed</h4>
          <p style={{ ...cardValue, color: "#166534" }}>
            {completedCount}
          </p>
        </div>
      </div>

      {/* Appointment Form */}
      <div style={sectionCard}>
        <AppointmentForm onSuccess={fetchAppointments} />
      </div>

      {/* Appointment List */}
      <div style={{ marginTop: 30 }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading appointments...</div>
        ) : (
          <AppointmentList
            appointments={appointments}
            refresh={fetchAppointments}
          />
        )}
      </div>
    </div>
  );
}

/* ================= Styles ================= */

const pageContainer = {
  padding: 10
};

const header = {
  marginBottom: 25
};

const subText = {
  fontSize: 14,
  color: "#64748b",
  marginTop: 4
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginBottom: 30
};

const card = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const cardTitle = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 10
};

const cardValue = {
  fontSize: 28,
  fontWeight: 700
};

const sectionCard = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};