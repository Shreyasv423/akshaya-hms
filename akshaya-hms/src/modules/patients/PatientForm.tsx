import { useState } from "react";
import { supabase } from "../../services/supabase";

export default function PatientForm({
  onAdded
}: {
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Patient name is required");
      return;
    }

    setLoading(true);

    /* Check duplicate phone */
    if (phone) {
      const { data: existing } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", phone)
        .single();

      if (existing) {
        alert("Patient with this phone number already exists.");
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("patients").insert([
      {
        name: name.trim(),
        age: age === "" ? null : Number(age),
        gender,
        phone: phone || null
      }
    ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    /* Reset */
    setName("");
    setAge("");
    setPhone("");
    setGender("Male");
    setLoading(false);

    onAdded();
  }

  return (
    <div style={cardStyle}>
      <h3 style={headingStyle}>Add New Patient</h3>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          style={inputStyle}
          placeholder="Patient Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

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

        <input
          style={inputStyle}
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving..." : "Save Patient"}
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
