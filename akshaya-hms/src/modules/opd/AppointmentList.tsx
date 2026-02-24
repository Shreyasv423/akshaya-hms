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

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("opd_appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    refresh();
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ fontWeight: 600 }}>
        Appointments ({appointments.length})
      </h3>

      <table style={table}>
        <thead>
          <tr style={thead}>
            <th style={th}>Token</th>
            <th style={th}>Patient</th>
            <th style={th}>Doctor</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td style={td}>{appt.token_number}</td>
              <td style={td}>{appt.patient_name}</td>
              <td style={td}>{appt.doctor_name}</td>

              <td style={td}>
                <span style={statusBadge(appt.status)}>
                  {appt.status}
                </span>
              </td>

              <td style={td}>
                {appt.status === "Waiting" && (
                  <button
                    style={startBtn}
                    onClick={() =>
                      updateStatus(appt.id, "In Consultation")
                    }
                  >
                    Start
                  </button>
                )}

                {appt.status === "In Consultation" && (
                  <button
                    style={completeBtn}
                    onClick={() =>
                      updateStatus(appt.id, "Completed")
                    }
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Billing Modal */}
      {showBilling && selectedAppointment && (
        <div style={overlay}>
          <div style={modal}>
            <OpdBillingModal
              patient={selectedAppointment}
              onClose={() => setShowBilling(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Styles ================= */

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: 15
};

const thead = {
  background: "#f1f5f9"
};

const th = {
  padding: 12,
  textAlign: "left" as const,
  fontSize: 14,
  color: "#475569"
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e2e8f0"
};

const startBtn = {
  padding: "6px 10px",
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 8
};

const completeBtn = {
  padding: "6px 10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 8
};

const billBtn = {
  padding: "6px 10px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "white",
  padding: 30,
  borderRadius: 14,
  width: 650,
  maxHeight: "90vh",
  overflowY: "auto" as const
};

const statusBadge = (status: string) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Waiting"
      ? "#fef3c7"
      : status === "In Consultation"
      ? "#e0f2fe"
      : "#dcfce7",
  color:
    status === "Waiting"
      ? "#b45309"
      : status === "In Consultation"
      ? "#0369a1"
      : "#166534"
});