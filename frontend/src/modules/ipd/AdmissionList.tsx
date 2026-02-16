import { useState, useMemo } from "react";
import type { Admission } from "./IpdDashboard";
import DischargeForm from "../discharge/DischargeForm";

type Props = {
  admissions: Admission[];
  refresh: () => void;
};

export default function AdmissionList({
  admissions,
  refresh
}: Props) {
  const [selectedAdmission, setSelectedAdmission] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) =>
      a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      a.bed_number?.toLowerCase().includes(search.toLowerCase())
    );
  }, [admissions, search]);

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={headingStyle}>
        Current Admissions ({filteredAdmissions.length})
      </h3>

      <input
        placeholder="Search by Patient / Doctor / Bed"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      <div style={{ display: "grid", gap: 16 }}>
        {filteredAdmissions.length === 0 && (
          <div style={{ color: "#64748b" }}>
            No active admissions.
          </div>
        )}

        {filteredAdmissions.map((a) => (
          <div key={a.id} style={cardStyle}>
            <div style={topRow}>
              <div>
                <div style={nameStyle}>{a.patient_name}</div>

                <div style={subText}>
                  Age: {a.age ?? "-"} | Gender: {a.gender}
                </div>

                <div style={dateStyle}>
                  Admitted On: {a.admission_date}
                </div>
              </div>

              <div style={statusBadge(a.status)}>
                {a.status}
              </div>
            </div>

            <div style={detailsRow}>
              <div>Doctor: {a.doctor_name}</div>

              <div style={bedBadge}>
                🛏 {a.bed_number}
              </div>
            </div>

            {a.status === "Admitted" && (
              <div style={{ marginTop: 14 }}>
                <button
                  style={buttonStyle}
                  onClick={() => setSelectedAdmission(a.id)}
                >
                  Generate Discharge
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedAdmission && (
        <DischargeForm
          admissionId={selectedAdmission}
          onClose={() => setSelectedAdmission(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

/* ========================= */
/* 🎨 Styles                 */
/* ========================= */

const headingStyle = {
  color: "#0c4a6e",
  marginBottom: 20,
  fontWeight: 600
};

const searchStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginBottom: 20,
  width: "100%"
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)",
  border: "1px solid #e0f2fe"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const nameStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#0c4a6e"
};

const subText = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 4
};

const dateStyle = {
  fontSize: 12,
  marginTop: 6,
  color: "#64748b"
};

const detailsRow = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14,
  color: "#334155"
};

const bedBadge = {
  padding: "4px 10px",
  background: "#f1f5f9",
  borderRadius: 6
};

const buttonStyle = {
  padding: "8px 12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const statusBadge = (status: string) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Admitted" ? "#dbeafe" : "#dcfce7",
  color:
    status === "Admitted" ? "#1d4ed8" : "#166534"
});
