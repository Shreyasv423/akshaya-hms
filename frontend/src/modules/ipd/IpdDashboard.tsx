import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import AdmissionForm from "./AdmissionForm";
import AdmissionList from "./AdmissionList";

export type Admission = {
  id: string;
  patient_name: string;
  age: number | null;
  gender: string;
  doctor_name: string;
  bed_number: string;
  diagnosis: string;
  status: string;
  admission_date: string;
  created_at: string;
};

export default function IpdDashboard() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  const fetchAdmissions = async () => {
    const { data } = await supabase
      .from("ipd_admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setAdmissions(data as Admission[]);
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        IPD Management
      </h2>

      <div style={{ display: "flex", gap: 30 }}>
        <div style={{ flex: 1 }}>
          <AdmissionForm onSuccess={fetchAdmissions} />
        </div>

        <div style={{ flex: 2 }}>
          <AdmissionList admissions={admissions} refresh={fetchAdmissions} />
        </div>
      </div>
    </div>
  );
}