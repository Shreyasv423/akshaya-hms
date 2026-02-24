import { useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  appointmentId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ConsultationForm({
  appointmentId,
  onClose,
  onSuccess
}: Props) {
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUp, setFollowUp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1️⃣ Save minimal consultation record
    const { error } = await supabase
      .from("opd_consultations")
      .insert([
        {
          appointment_id: appointmentId,
          diagnosis,
          prescription,
          follow_up_date: followUp || null
        }
      ]);

    if (error) {
      console.error(error);
      alert("Error saving consultation");
      return;
    }

    // 2️⃣ Directly mark appointment completed
    await supabase
      .from("opd_appointments")
      .update({ status: "Completed" })
      .eq("id", appointmentId);

    onSuccess();
    onClose();
  };

  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h3>Consultation Summary</h3>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <textarea
            placeholder="Diagnosis (Short)"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />

          <textarea
            placeholder="Prescription (Short)"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
          />

          <input
            type="date"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={saveBtn}>
              Save & Complete
            </button>

            <button
              type="button"
              style={cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const modalStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const boxStyle = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  width: 450
};

const saveBtn = {
  background: "#16a34a",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const cancelBtn = {
  background: "#dc2626",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};
