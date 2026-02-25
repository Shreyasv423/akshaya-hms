import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  onSuccess: () => void;
  initialPatientId?: string | null;
};

type Patient = {
  id: string;
  name: string;
  phone?: string;
  age?: number;
};

type Doctor = {
  id: string;
  name: string;
  department?: string;
};

export default function AppointmentForm({ onSuccess, initialPatientId }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("name");

    setDoctors(data || []);
  };

  const createAppointment = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient");
      return;
    }
    if (!selectedDoctorId) {
      alert("Please select a doctor");
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    const doctor = doctors.find(d => d.id === selectedDoctorId);

    if (!patient || !doctor) {
      alert("Selected patient or doctor not found. Please try again.");
      return;
    }

    setSaving(true);

    // Auto token: get today's max token to reset tokens daily
    const today = new Date().toISOString().split("T")[0];
    const { data: lastToken } = await supabase
      .from("opd_appointments")
      .select("token_number")
      .eq("visit_date", today)
      .order("token_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextToken = lastToken?.token_number
      ? lastToken.token_number + 1
      : 1;

    const { error } = await supabase
      .from("opd_appointments")
      .insert({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctorId,
        token_number: nextToken,
        patient_name: patient.name,
        age: patient.age ?? null,
        phone: patient.phone ?? null,
        doctor_name: doctor.name,
        visit_date: today,
        status: "Waiting"
      });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    setSelectedPatientId("");
    setSelectedDoctorId("");
    setSaving(false);
    onSuccess();
  };

  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 600, color: "#0c4a6e" }}>
        Create New Appointment
      </h3>

      <div style={grid}>
        {/* Patient */}
        <div style={field}>
          <label style={label}>Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={input}
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.phone ? ` — ${p.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor */}
        <div style={field}>
          <label style={label}>Doctor</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={input}
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}{d.department ? ` (${d.department})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {doctors.length === 0 && (
        <p style={{ color: "#f59e0b", fontSize: 13, marginTop: 10 }}>
          ⚠ No active doctors found. Please add doctors in the admin settings.
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={createAppointment}
          disabled={saving}
          style={saveBtn}
        >
          {saving ? "Creating..." : "✓ Create Appointment"}
        </button>
      </div>
    </div>
  );
}

/* Styles */

const card: React.CSSProperties = {
  background: "#ffffff",
  padding: 25,
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column"
};

const label: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 13,
  color: "#475569",
  fontWeight: 600
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  background: "#fff"
};

const saveBtn: React.CSSProperties = {
  padding: "10px 24px",
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};