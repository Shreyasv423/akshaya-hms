import { useState } from "react";
import type { Admission } from "./IpdDashboard";
import DischargeForm from "../discharge/DischargeForm";

type Props = {
  admissions: Admission[];
  refresh: () => void;
};

export default function AdmissionList({ admissions, refresh }: Props) {
  const [selectedAdmission, setSelectedAdmission] = useState<string | null>(null);

  return (
    <div style={{ marginTop: 10 }}>


      <div style={{ display: "grid", gap: 16 }}>
        {admissions.map(a => (
          <div key={a.id} style={card}>
            <div style={row}>
              <div>
                <div style={name}>{a.patient_name}</div>
                <div style={sub}>
                  Age: {a.age ?? "-"} | {a.gender}
                </div>
                <div style={date}>Admitted: {a.admission_date}</div>
              </div>

              <div style={badge(a.status)}>
                {a.status}
              </div>
            </div>

            <div style={details}>
              <span>Doctor: {a.doctor_name}</span>
              <span>Bed: {a.bed_number}</span>
            </div>

            {a.status === "Admitted" && (
              <button
                style={btn}
                onClick={() => setSelectedAdmission(a.id)}
              >
                Generate Discharge
              </button>
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

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const row = {
  display: "flex",
  justifyContent: "space-between"
};

const name = {
  fontWeight: 600,
  color: "#0c4a6e"
};

const sub = {
  fontSize: 13,
  color: "#64748b"
};

const date = {
  fontSize: 12,
  marginTop: 4,
  color: "#64748b"
};

const details = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between"
};

const btn = {
  marginTop: 14,
  padding: "8px 12px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const badge = (status: string) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  background: status === "Admitted" ? "#dbeafe" : "#dcfce7",
  color: status === "Admitted" ? "#1d4ed8" : "#166534"
});