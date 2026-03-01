import { useState } from "react";
import { supabase } from "../../services/supabase";
import type { Appointment } from "./OpdDashboard";
import OpdBillingModal from "./OpdBillingModal";

type Props = {
  appointments: Appointment[];
  refresh: () => void;
};

export default function AppointmentList({ appointments, refresh }: Props) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("opd_appointments")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    refresh();
  };

  if (appointments.length === 0) {
    return (
      <div style={emptyState}>
        <p style={{ fontSize: 32 }}>🏥</p>
        <p style={{ color: "#64748b", fontSize: 15 }}>No appointments today yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: 16, color: "#0c4a6e" }}>
        Today's Appointments ({appointments.length})
      </h3>

      {/* Desktop table */}
      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={thead}>
              <th style={th}>Token</th>
              <th style={th}>Patient</th>
              <th style={th}>Phone</th>
              <th style={th}>Doctor</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} style={tr}>
                <td style={{ ...td, fontWeight: 700, color: "#0369a1" }}>
                  #{appt.token_number}
                </td>
                <td style={td}>
                  <div style={{ fontWeight: 500 }}>{appt.patient_name}</div>
                  {appt.age && (
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Age: {appt.age}</div>
                  )}
                </td>
                <td style={{ ...td, color: "#64748b", fontSize: 13 }}>
                  {appt.phone || "—"}
                </td>
                <td style={td}>{appt.doctor_name}</td>

                <td style={td}>
                  <span style={statusBadge(appt.status)}>
                    {appt.status}
                  </span>
                </td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {appt.status === "Waiting" && (
                      <button
                        style={startBtn}
                        disabled={updatingId === appt.id}
                        onClick={() => updateStatus(appt.id, "In Consultation")}
                      >
                        Start
                      </button>
                    )}

                    {appt.status === "In Consultation" && (
                      <button
                        style={completeBtn}
                        disabled={updatingId === appt.id}
                        onClick={() => updateStatus(appt.id, "Completed")}
                      >
                        Complete
                      </button>
                    )}

                    {appt.status === "Completed" && (
                      <button
                        style={billBtn}
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setShowBilling(true);
                        }}
                      >
                        Generate Bill
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Billing Modal */}
      {showBilling && selectedAppointment && (
        <div style={overlay}>
          <div style={modal}>
            <OpdBillingModal
              patient={selectedAppointment}
              onClose={() => {
                setShowBilling(false);
                setSelectedAppointment(null);
              }}
              onSuccess={refresh}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Styles ================= */

const tableWrapper: React.CSSProperties = {
  overflowX: "auto",
  background: "white",
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)"
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 620
};

const thead: React.CSSProperties = {
  background: "#f0f9ff"
};

const th: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  color: "#0369a1",
  borderBottom: "1px solid #e0f2fe",
  whiteSpace: "nowrap"
};

const td: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 14,
  verticalAlign: "middle"
};

const tr: React.CSSProperties = {
  transition: "background 0.15s"
};

const startBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500
};

const completeBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500
};

const billBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1500,
  padding: 16
};

const modal: React.CSSProperties = {
  background: "white",
  padding: 30,
  borderRadius: 16,
  width: "100%",
  maxWidth: 680,
  maxHeight: "90vh",
  overflowY: "auto"
};

const statusBadge = (status: string): React.CSSProperties => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
  background:
    status === "Waiting"
      ? "#fef3c7"
      : status === "In Consultation"
        ? "#e0f2fe"
        : status === "Completed"
          ? "#dcfce7"
          : "#f3e8ff", // Billed
  color:
    status === "Waiting"
      ? "#b45309"
      : status === "In Consultation"
        ? "#0369a1"
        : status === "Completed"
          ? "#166534"
          : "#6b21a8" // Billed
});

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  background: "white",
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
};