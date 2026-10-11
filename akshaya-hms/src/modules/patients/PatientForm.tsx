import { useState } from "react";
import { supabase } from "../../services/supabase";
import { generateUHID } from "../../utils/patient";

export default function PatientForm({
  onAdded
}: {
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [uhid, setUhid] = useState(generateUHID());
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Patient name is required");
      return;
    }

    setLoading(true);

    const basePayload = {
      name: name.trim(),
      age: age === "" ? null : Number(age),
      gender,
      phone: phone.trim() || null
    };

    // Try saving with UHID first
    let res = await supabase.from("patients").insert([{ ...basePayload, uhid }]);

    // If PostgreSQL column uhid doesn't exist (error 42703), safely fallback to basePayload
    if (res.error && res.error.code === "42703") {
      res = await supabase.from("patients").insert([basePayload]);
    }

    if (res.error) {
      alert("Error adding patient: " + res.error.message);
      setLoading(false);
      return;
    }

    alert(`Patient ${name.trim()} registered successfully with ID: ${uhid}`);

    /* Reset */
    setName("");
    setAge("");
    setPhone("");
    setGender("Male");
    setUhid(generateUHID());
    setLoading(false);

    onAdded();
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ ...headingStyle, margin: 0 }}>Add New Patient</h3>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 12px", borderRadius: 8, fontSize: 13, color: "#166534", fontWeight: 600 }}>
          Assigned ID: {uhid}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Patient ID / UHID (Auto-generated)</label>
          <input
            style={{ ...inputStyle, background: "#f8fafc", fontWeight: 600, color: "#0369a1" }}
            value={uhid}
            onChange={e => setUhid(e.target.value.toUpperCase())}
            placeholder="Unique Health ID"
            required
          />
        </div>

        <input
          style={inputStyle}
          placeholder="Patient Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            style={inputStyle}
            placeholder="Age"
            type="number"
            value={age}
            onChange={e =>
              setAge(e.target.value === "" ? "" : Number(e.target.value))
            }
          />

          <select
            style={inputStyle}
            value={gender}
            onChange={e => setGender(e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <input
          style={inputStyle}
          placeholder="Phone Number (e.g. 9876543210)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving Patient..." : `Register Patient (${uhid})`}
        </button>
      </form>
    </div>
  );
}

/* ========================= */
/* Styles */
/* ========================= */

const cardStyle = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(14,165,233,0.08)",
  border: "1px solid #e0f2fe",
  marginBottom: 30
};

const headingStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: "#0c4a6e",
  marginBottom: 20
};

const formStyle = {
  display: "grid",
  gap: 14
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  outline: "none"
};

const buttonStyle = {
  padding: "10px 16px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer"
};
