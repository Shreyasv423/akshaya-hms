import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import AppointmentForm from "./AppointmentForm";
import AppointmentList from "./AppointmentList";

export type Appointment = {
  id: string;
  token_number: number;
  patient_name: string;
  age: number;
  phone: string;
  doctor_name: string;
  status: string;
  visit_date: string;
};

export default function OpdDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("opd_appointments")   // ✅ CHANGED HERE
      .select("*")
      .order("token_number", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAppointments();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
        OPD Management
      </h2>

      <AppointmentForm onSuccess={fetchAppointments} />

      {loading && (
        <div style={{ marginTop: 20 }}>Loading...</div>
      )}

      <AppointmentList
        appointments={appointments}
        refresh={fetchAppointments}
      />
    </div>
  );
}
