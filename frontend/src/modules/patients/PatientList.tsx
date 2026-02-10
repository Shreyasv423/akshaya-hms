import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabase";
import Card from "../../components/ui/Card";
import PatientForm from "./PatientForm";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
};

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPatients() {
    setLoading(true);
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });
    setPatients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      <p>Register and manage hospital patients</p>

      <PatientForm onAdded={loadPatients} />

      {loading && <p>Loading…</p>}

      {!loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <table>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 12 }}>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
