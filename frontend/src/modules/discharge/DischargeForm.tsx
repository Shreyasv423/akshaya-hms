import { useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  admissionId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DischargeForm({
  admissionId,
  onClose,
  onSuccess
}: Props) {
  const [form, setForm] = useState({
    final_diagnosis: "",
    discharge_summary: "",
    advice: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    /* 1️⃣ Insert discharge record */
    const { error: dischargeError } = await supabase
      .from("discharge_records")
      .insert([
        {
          admission_id: admissionId,
          final_diagnosis: form.final_diagnosis,
          discharge_summary: form.discharge_summary,
          advice: form.advice
        }
      ]);

    if (dischargeError) {
      alert(dischargeError.message);
      setLoading(false);
      return;
    }

    /* 2️⃣ Update admission status */
    const { error: updateError } = await supabase
      .from("ipd_admissions")
      .update({ status: "Discharged" })
      .eq("id", admissionId);

    if (updateError) {
      alert(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h3 style={{ marginBottom: 15 }}>Generate Discharge</h3>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <textarea
            name="final_diagnosis"
            placeholder="Final Diagnosis"
            value={form.final_diagnosis}
            onChange={handleChange}
            required
          />

          <textarea
            name="discharge_summary"
            placeholder="Discharge Summary"
            value={form.discharge_summary}
            onChange={handleChange}
            required
          />

          <textarea
            name="advice"
            placeholder="Advice"
            value={form.advice}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button style={saveBtn} disabled={loading}>
              {loading ? "Processing..." : "Discharge Patient"}
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

/* Styles */

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
  padding: 20,
  borderRadius: 10,
  width: 500
};

const saveBtn = {
  background: "#16a34a",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};

const cancelBtn = {
  background: "#dc2626",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};
