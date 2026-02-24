import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabase";
import PatientForm from "./PatientForm";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  created_at?: string;
};

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    void loadPatients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.gender?.toLowerCase().includes(q)
    );
  }, [patients, search]);

  return (
    <div>
      <div style={headerWrapper}>
        <div>
          <h2 style={headingStyle}>Patient Management</h2>
          <p style={subHeadingStyle}>
            Register and manage hospital patients
          </p>
        </div>
        <div style={statBadge}>
          {patients.length} total patient{patients.length !== 1 ? "s" : ""}
        </div>
      </div>

      <PatientForm onAdded={loadPatients} />

      {/* Search */}
      <div style={searchWrapper}>
        <input
          style={searchInput}
          placeholder="🔍  Search by name, phone or gender..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <p style={{ color: "#64748b", fontSize: 14 }}>Loading patients...</p>
      )}

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.length === 0 ? (
            <div style={emptyState}>
              <p style={{ fontSize: 32 }}>👥</p>
              <p style={{ color: "#64748b" }}>
                {search ? "No patients match your search." : "No patients registered yet."}
              </p>
            </div>
          ) : (
            <div style={tableCard}>
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={theadRow}>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Age</th>
                      <th style={thStyle}>Gender</th>
                      <th style={thStyle}>Phone</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((p, index) => (
                      <tr key={p.id} style={rowStyle}>
                        <td style={{ ...tdStyle, color: "#94a3b8", fontSize: 13 }}>
                          {index + 1}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                        <td style={tdStyle}>{p.age ?? "—"}</td>
                        <td style={tdStyle}>
                          <span style={genderBadge(p.gender)}>
                            {p.gender}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "#64748b" }}>
                          {p.phone || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ========================= */
/* 🎨 Styles                 */
/* ========================= */

const headerWrapper: React.CSSProperties = {
  marginBottom: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 12
};

const headingStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0c4a6e",
  marginBottom: 4
};

const subHeadingStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 14
};

const statBadge: React.CSSProperties = {
  background: "#e0f2fe",
  color: "#0369a1",
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600
};

const searchWrapper: React.CSSProperties = {
  marginBottom: 20
};

const searchInput: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  width: "100%",
  maxWidth: 420
};

const tableCard: React.CSSProperties = {
  background: "white",
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  overflow: "hidden"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480
};

const theadRow: React.CSSProperties = {
  background: "#f0f9ff"
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
  color: "#0369a1",
  borderBottom: "1px solid #e0f2fe",
  whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: 14
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.15s"
};

const genderBadge = (gender: string): React.CSSProperties => ({
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    gender === "Male" ? "#dbeafe" : gender === "Female" ? "#fce7f3" : "#f3f4f6",
  color:
    gender === "Male" ? "#1d4ed8" : gender === "Female" ? "#be185d" : "#374151"
});

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: 60,
  background: "white",
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
};
