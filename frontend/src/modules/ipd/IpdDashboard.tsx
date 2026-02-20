import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../../services/supabase";
import AdmissionForm from "./AdmissionForm";
import AdmissionList from "./AdmissionList";

export type Admission = {
  admission_date: ReactNode;
  id: string;
  patient_name: string;
  age: number | null;
  gender: string;
  doctor_name: string;
  bed_number: string;
  diagnosis: string;
  status: string;
  created_at: string;
};

export default function IpdDashboard() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);

  const fetchAdmissions = async () => {
    const { data } = await supabase
      .from("ipd_admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setAdmissions(data as Admission[]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAdmissions();
  }, []);

  return (
    <div>
      <h2 style={headingStyle}>IPD Management</h2>

      <div style={layoutStyle}>
        {/* Left Side Form */}
        <div style={{ flex: 1 }}>
          <AdmissionForm onSuccess={fetchAdmissions} />
        </div>

        {/* Right Side List */}
        <div style={{ flex: 2 }}>
          <AdmissionList
            admissions={admissions}
            refresh={fetchAdmissions}
          />
        </div>
      </div>
    </div>
  );
}

const headingStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0c4a6e",
  marginBottom: 20
};

const layoutStyle = {
  display: "flex",
  gap: 30,
  alignItems: "flex-start"
};
