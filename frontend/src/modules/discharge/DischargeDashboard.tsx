import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";

type Discharge = {
  id: string;
  admission_id: string;
  final_diagnosis: string;
  discharge_summary: string;
  advice: string;
  discharge_date: string;
};

export default function DischargeDashboard() {
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [search, setSearch] = useState("");

  const fetchDischarges = async () => {
    const { data, error } = await supabase
      .from("discharge_records")
      .select("*")
      .order("discharge_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setDischarges(data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDischarges();
  }, []);

  const filteredDischarges = useMemo(() => {
    return discharges.filter(
      (d) =>
        d.final_diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
        d.discharge_summary?.toLowerCase().includes(search.toLowerCase())
    );
  }, [discharges, search]);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
        Discharged Patients ({filteredDischarges.length})
      </h2>

      <input
        placeholder="Search diagnosis or summary"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      <div style={{ display: "grid", gap: 16 }}>
        {filteredDischarges.length === 0 && (
          <div style={{ color: "#64748b" }}>
            No discharge records found.
          </div>
        )}

        {filteredDischarges.map((d) => (
          <div key={d.id} style={cardStyle}>
            <div style={topRow}>
              <div style={diagnosisStyle}>
                {d.final_diagnosis}
              </div>

              <div style={dateStyle}>
                {d.discharge_date}
              </div>
            </div>

            <div style={summaryStyle}>
              {d.discharge_summary}
            </div>

            {d.advice && (
              <div style={adviceStyle}>
                Advice: {d.advice}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= */
/* Styles                    */
/* ========================= */

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
  alignItems: "center"
};

const diagnosisStyle = {
  fontWeight: 600,
  color: "#0c4a6e"
};

const dateStyle = {
  fontSize: 13,
  color: "#64748b"
};

const summaryStyle = {
  marginTop: 10,
  fontSize: 14,
  color: "#334155"
};

const adviceStyle = {
  marginTop: 10,
  fontSize: 13,
  color: "#475569",
  fontStyle: "italic"
};
