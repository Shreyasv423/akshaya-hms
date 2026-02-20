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
  phone?: string;
};

type Doctor = {
  id: string;
  name: string;
};

type TokenRow = {
  token_number: number;
};

export default function AppointmentForm({ onSuccess }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [token, setToken] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    gender: "",
    phone: "",
    doctor_name: "",
    visit_type: "New"
  });

  async function fetchPatients() {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPatients(data);
  }

  async function fetchDoctors() {
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true);

    if (data) setDoctors(data);
  }

  /* ========================= */
  /* Generate Daily Token */
  /* ========================= */
  async function generateToken() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("opd_appointments")
      .select("token_number")
      .eq("visit_date", today);

    if (data && data.length > 0) {
      const maxToken = Math.max(
        ...(data as TokenRow[]).map((d) => d.token_number || 0)
      );
      setToken(maxToken + 1);
    } else {
      setToken(1);
    }
  }

  /* ========================= */
  /* Load Patients & Doctors */
  /* ========================= */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPatients();
    void fetchDoctors();
    void generateToken();
  }, []);

  /* ========================= */
  /* Handle Change */
  /* ========================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "patient_name") {
      const selectedPatient = patients.find(
        (p) => p.name === value
      );

      setForm({
        ...form,
        patient_name: selectedPatient?.name || "",
        age: String(selectedPatient?.age ?? ""),
        gender: selectedPatient?.gender || "",
        phone: selectedPatient?.phone || ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /* ========================= */
  /* Submit */
  /* ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patient_name || !form.doctor_name) {
      alert("Please select patient and doctor");
      return;
    }

    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("opd_appointments")
      .insert([
        {
          patient_name: form.patient_name,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          phone: form.phone,
          doctor_name: form.doctor_name,
          visit_type: form.visit_type,
          token_number: token,
          visit_date: today,
          status: "Waiting"
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
      phone: "",
      doctor_name: "",
      visit_type: "New"
    });

    setLoading(false);
    generateToken();
    onSuccess();
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>New OPD Appointment</h3>

      <div style={{ marginBottom: 15, fontWeight: 600 }}>
        Token Number: {token}
      </div>

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
              {p.name} ({p.phone || "No Phone"})
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

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving..." : "Send to OPD"}
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
