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
  phone?: string;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPatients();
  }, []);

  return (
    <div>
      <div style={headerWrapper}>
        <h2 style={headingStyle}>Patient Management</h2>
        <p style={subHeadingStyle}>
          Register and manage hospital patients
        </p>
      </div>

      <PatientForm onAdded={loadPatients} />

      {loading && <p style={{ marginTop: 20 }}>Loading patients...</p>}

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={theadRow}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Gender</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} style={rowStyle}>
                      <td style={tdStyle}>{p.name}</td>
                      <td style={tdStyle}>{p.age}</td>
                      <td style={tdStyle}>
                        <span style={genderBadge(p.gender)}>
                          {p.gender}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

/* ========================= */
/* 🎨 Styles (Blue Theme)    */
/* ========================= */

const headerWrapper = {
  marginBottom: 20
};

const headingStyle = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0c4a6e",
  marginBottom: 4
};

const subHeadingStyle = {
  color: "#64748b",
  fontSize: 14
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const
};

const theadRow = {
  background: "#f0f9ff"
};

const thStyle = {
  padding: 14,
  textAlign: "left" as const,
  fontWeight: 600,
  color: "#0369a1",
  borderBottom: "1px solid #e2e8f0"
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 14
};

const rowStyle = {
  transition: "background 0.2s"
};

const genderBadge = (gender: string) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    gender === "Male" ? "#dbeafe" : "#fce7f3",
  color:
    gender === "Male" ? "#1d4ed8" : "#be185d"
});
