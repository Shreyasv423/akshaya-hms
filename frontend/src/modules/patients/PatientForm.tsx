import { useState } from "react";
import { supabase } from "../../services/supabase";

export default function PatientForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("patients").insert([
      { name, age, gender, phone }
    ]);

    if (error) {
      alert(error.message);
    } else {
      setName(""); setAge(""); setPhone("");
      onAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <h3>Add Patient</h3>

      <input placeholder="Name" value={name}
        onChange={e => setName(e.target.value)} required />

      <input placeholder="Age" type="number" value={age}
        onChange={e => setAge(Number(e.target.value))} required />

      <select value={gender} onChange={e => setGender(e.target.value)}>
        <option>Male</option>
        <option>Female</option>
      </select>

      <input placeholder="Phone" value={phone}
        onChange={e => setPhone(e.target.value)} />

      <button type="submit">Save</button>
    </form>
  );
}
