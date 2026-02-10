import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
};

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    supabase.from("patients").select("*").then(({ data, error }) => {
      if (error) {
        console.error(error);
      } else {
        setPatients(data || []);
      }
    });
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Patients</h2>

      {patients.length === 0 && <p>No patients found</p>}

      <ul>
        {patients.map(p => (
          <li key={p.id}>
            {p.name} — {p.age} — {p.gender}
          </li>
        ))}
      </ul>
    </div>
  );
}
