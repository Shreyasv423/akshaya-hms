import { useState, useMemo } from "react";
import { supabase } from "../../services/supabase";
import ConsultationForm from "./ConsultationForm";

type Appointment = {
  id: string;
  patient_name: string;
  age: number;
  phone: string;
  doctor_name: string;
  token_number: number;
  status: string;
  visit_date: string;
};

type Props = {
  appointments: Appointment[];
  refresh: () => void;
};

export default function AppointmentList({
  appointments,
  refresh
}: Props) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (a) =>
        a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        a.phone?.includes(search) ||
        String(a.token_number).includes(search)
    );
  }, [appointments, search]);

  const markComplete = async (id: string) => {
    await supabase
      .from("opd_appointments")
      .update({ status: "Completed" })
      .eq("id", id);

    refresh();
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={headingStyle}>
        OPD Appointments ({filteredAppointments.length})
      </h3>

      <input
        placeholder="Search by Name / Phone / Token"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      <div style={{ display: "grid", gap: 16 }}>
        {filteredAppointments.length === 0 && (
          <div style={{ color: "#64748b" }}>
            No appointments found.
          </div>
        )}

        {filteredAppointments.map((a) => (
          <div key={a.id} style={cardStyle}>
            <div style={topRow}>
              <div>
                <div style={nameStyle}>
                  #{a.token_number} - {a.patient_name}
                </div>

                <div style={subText}>
                  Age: {a.age} | Doctor: {a.doctor_name}
                </div>
              </div>

              <div style={statusBadge(a.status)}>
                {a.status}
              </div>
            </div>

            {a.status === "Waiting" && (
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <button
                  style={buttonStyle}
                  onClick={() => setSelectedAppointment(a.id)}
                >
                  Start Consultation
                </button>

                <button
                  style={completeButton}
                  onClick={() => markComplete(a.id)}
                >
                  Mark Complete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedAppointment && (
        <ConsultationForm
          appointmentId={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

/* Styles */

const headingStyle = {
  color: "#0c4a6e",
  marginBottom: 20,
  fontWeight: 600
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)",
  border: "1px solid #e0f2fe"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const nameStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#0c4a6e"
};

const subText = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 4
};

const buttonStyle = {
  padding: "8px 12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const completeButton = {
  padding: "8px 12px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const searchStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginBottom: 20,
  width: "100%"
};

const statusBadge = (status: string) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Waiting"
      ? "#dbeafe"
      : "#dcfce7",
  color:
    status === "Waiting"
      ? "#1d4ed8"
      : "#166534"
});
