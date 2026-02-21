import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  onSuccess: () => void;
};

export default function AppointmentForm({ onSuccess }: Props) {
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
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
      alert("Select patient");
      return;
    }

    if (!selectedDoctorId) {
      alert("Select doctor");
      return;
    }

    setSaving(true);

    // Auto token
    const { data: lastToken } = await supabase
      .from("opd_appointments")
      .select("token_number")
      .order("token_number", { ascending: false })
      .limit(1)
      .single();

    const nextToken = lastToken?.token_number
      ? lastToken.token_number + 1
      : 1;

    const patient = patients.find(p => p.id === selectedPatientId);
    const doctor = doctors.find(d => d.id === selectedDoctorId);

    const { error } = await supabase
      .from("opd_appointments")
      .insert({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctorId,
        token_number: nextToken,
        patient_name: patient.name,
        age: patient.age,
        phone: patient.phone,
        doctor_name: doctor.name,
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
      <h3 style={{ marginBottom: 20 }}>Create New Appointment</h3>

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
                {p.name} - {p.phone}
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
                {d.name} ({d.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={createAppointment}
          disabled={saving}
          style={saveBtn}
        >
          {saving ? "Creating..." : "Create Appointment"}
        </button>
      </div>
    </div>
  );
}

/* Styles */

const card = {
  background: "#ffffff",
  padding: 25,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 20
};

const field = {
  display: "flex",
  flexDirection: "column" as const
};

const label = {
  marginBottom: 6,
  fontSize: 14,
  color: "#475569",
  fontWeight: 500
};

const input = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  fontSize: 14
};

const saveBtn = {
  padding: "10px 20px",
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600
};