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
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.final_diagnosis.trim() || !form.discharge_summary.trim()) {
      alert("Final Diagnosis and Discharge Summary are required.");
      return;
    }

    setLoading(true);

    /* 1️⃣ Insert discharge record */
    const { error: dischargeError } = await supabase
      .from("discharge_records")
      .insert([
        {
          admission_id: admissionId,
          final_diagnosis: form.final_diagnosis.trim(),
          discharge_summary: form.discharge_summary.trim(),
          advice: form.advice.trim() || null,
          discharge_date: new Date().toISOString().split("T")[0]
        }
      ]);

    if (dischargeError) {
      alert(dischargeError.message);
      setLoading(false);
      return;
    }

    /* 2️⃣ Update admission status to Discharged */
    const { data: admissionData, error: updateError } = await supabase
      .from("ipd_admissions")
      .update({ status: "Discharged" })
      .eq("id", admissionId)
      .select("bed_id")
      .single();

    if (updateError) {
      alert(updateError.message);
      setLoading(false);
      return;
    }

    /* 3️⃣ Free up the bed (bug fix: this was missing before) */
    if (admissionData?.bed_id) {
      await supabase
        .from("beds")
        .update({ is_occupied: false })
        .eq("id", admissionData.bed_id);
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <div style={headerRow}>
          <h3 style={{ margin: 0 }}>Generate Discharge</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Final Diagnosis *</label>
            <textarea
              name="final_diagnosis"
              placeholder="Enter final diagnosis..."
              value={form.final_diagnosis}
              onChange={handleChange}
              required
              rows={2}
              style={textareaStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Discharge Summary *</label>
            <textarea
              name="discharge_summary"
              placeholder="Enter discharge summary..."
              value={form.discharge_summary}
              onChange={handleChange}
              required
              rows={4}
              style={textareaStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Advice / Follow-up Instructions</label>
            <textarea
              name="advice"
              placeholder="Medications, follow-up, restrictions..."
              value={form.advice}
              onChange={handleChange}
              rows={2}
              style={textareaStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" style={cancelBtnStyle} onClick={onClose}>
              Cancel
            </button>
            <button style={saveBtnStyle} disabled={loading}>
              {loading ? "Processing..." : "Discharge Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Styles */

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: 16
};

const boxStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 14,
  width: "100%",
  maxWidth: 520,
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#475569"
};

const textareaStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  resize: "vertical",
  fontFamily: "inherit",
  color: "#1e293b"
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  color: "#64748b",
  padding: "4px 8px"
};

const saveBtnStyle: React.CSSProperties = {
  background: "#16a34a",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer"
};

const cancelBtnStyle: React.CSSProperties = {
  background: "#f1f5f9",
  color: "#475569",
  padding: "10px 20px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontWeight: 500,
  cursor: "pointer"
};
