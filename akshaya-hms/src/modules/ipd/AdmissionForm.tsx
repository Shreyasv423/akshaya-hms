import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  onSuccess: () => void;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
};

type Doctor = {
  id: string;
  name: string;
};

type Bed = {
  id: string;
  bed_number: string;
  ward: string;
};

export default function AdmissionForm({ onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [bedId, setBedId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: p } = await supabase.from("patients").select("*");
    const { data: d } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true);
    const { data: b } = await supabase
      .from("beds")
      .select("*")
      .eq("is_occupied", false);

    setPatients(p || []);
    setDoctors(d || []);
    setBeds(b || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId || !doctorId || !bedId) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    const bed = beds.find(b => b.id === bedId);

    const { error } = await supabase.from("ipd_admissions").insert({
      patient_id: patientId,
      doctor_id: doctorId,
      patient_name: patient?.name,
      doctor_name: doctor?.name,
      age: patient?.age,
      gender: patient?.gender,
      bed_id: bedId,
      bed_number: bed?.bed_number,
      diagnosis,
      status: "Admitted"
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("beds")
      .update({ is_occupied: true })
      .eq("id", bedId);

    setPatientId("");
    setDoctorId("");
    setBedId("");
    setDiagnosis("");
    setLoading(false);

    fetchData();
    onSuccess();
  };

  return (
    <div style={card}>
      <h3 style={title}>Admit Patient</h3>

      <form onSubmit={handleSubmit} style={form}>
        <select value={patientId} onChange={e => setPatientId(e.target.value)} style={input} required>
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={doctorId} onChange={e => setDoctorId(e.target.value)} style={input} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select value={bedId} onChange={e => setBedId(e.target.value)} style={input} required>
          <option value="">Select Available Bed</option>
          {beds.map(b => (
            <option key={b.id} value={b.id}>
              Bed {b.bed_number} ({b.ward})
            </option>
          ))}
        </select>

        <input
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={e => setDiagnosis(e.target.value)}
          style={input}
          required
        />

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Admitting..." : "Admit Patient"}
        </button>
      </form>
    </div>
  );
}

const card = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 14,
  boxShadow: "0 6px 16px rgba(0,0,0,0.05)"
};

const title = {
  marginBottom: 16,
  fontWeight: 600,
  color: "#0c4a6e"
};

const form = {
  display: "grid",
  gap: 14
};

const input = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1"
};

const button = {
  padding: "10px 14px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer"
};