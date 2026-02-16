import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  onSuccess: () => void;
};

export default function AdmissionForm({ onSuccess }: Props) {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [occupiedBeds, setOccupiedBeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    gender: "",
    doctor_name: "",
    bed_number: "",
    diagnosis: ""
  });

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchOccupiedBeds();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPatients(data);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true);

    if (data) setDoctors(data);
  };

  const fetchOccupiedBeds = async () => {
    const { data } = await supabase
      .from("ipd_admissions")
      .select("bed_number")
      .eq("status", "Admitted");

    if (data) {
      setOccupiedBeds(data.map((d: any) => d.bed_number));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === "patient_name") {
      const selectedPatient = patients.find(
        (p) => p.name === value
      );

      setForm({
        ...form,
        patient_name: selectedPatient?.name || "",
        age: selectedPatient?.age || "",
        gender: selectedPatient?.gender || ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (occupiedBeds.includes(form.bed_number)) {
      alert("This bed is already occupied!");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("ipd_admissions")
      .insert([
        {
          patient_name: form.patient_name,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          doctor_name: form.doctor_name,
          bed_number: form.bed_number,
          diagnosis: form.diagnosis,
          status: "Admitted"
        }
      ]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setForm({
      patient_name: "",
      age: "",
      gender: "",
      doctor_name: "",
      bed_number: "",
      diagnosis: ""
    });

    setLoading(false);
    fetchOccupiedBeds();
    onSuccess();
  };

  const allBeds = Array.from({ length: 20 }, (_, i) => `Bed-${i + 1}`);
  const availableBeds = allBeds.filter(
    (bed) => !occupiedBeds.includes(bed)
  );

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>Admit Patient (IPD)</h3>

      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Select Patient */}
        <select
          name="patient_name"
          value={form.patient_name}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Select Doctor */}
        <select
          name="doctor_name"
          value={form.doctor_name}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Select Bed */}
        <select
          name="bed_number"
          value={form.bed_number}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Available Bed</option>
          {availableBeds.map((bed) => (
            <option key={bed} value={bed}>
              {bed}
            </option>
          ))}
        </select>

        <input
          name="diagnosis"
          placeholder="Diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Admitting..." : "Admit Patient"}
        </button>
      </form>
    </div>
  );
}

/* Styles */

const cardStyle = {
  background: "white",
  padding: 28,
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(14,165,233,0.08)",
  border: "1px solid #e0f2fe",
  marginTop: 30
};

const titleStyle = {
  marginBottom: 20,
  color: "#0c4a6e",
  fontWeight: 600
};

const formStyle = {
  display: "grid",
  gap: 14
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14
};

const buttonStyle = {
  marginTop: 10,
  padding: "10px 14px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer"
};
