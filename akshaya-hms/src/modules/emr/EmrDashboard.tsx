import { useState } from "react";
import { supabase } from "../../services/supabase";
import { Search, Activity, Stethoscope, Pill, FlaskConical, Calendar, UserCheck, ShieldAlert } from "lucide-react";
import { getPatientIdentifier, type BasePatient } from "../../utils/patient";

type EMRPatient = BasePatient & {
  blood_group?: string | null;
};

type TimelineItem = {
  id: string;
  date: string;
  type: "opd" | "ipd" | "icu" | "lab" | "pharmacy";
  title: string;
  desc: string;
};

export default function EmrDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidatePatients, setCandidatePatients] = useState<EMRPatient[]>([]);
  const [patient, setPatient] = useState<EMRPatient | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPatientTimeline = async (patientRecord: EMRPatient) => {
    setLoading(true);
    setPatient(patientRecord);
    setCandidatePatients([]);

    const evts: TimelineItem[] = [];

    try {
      // 1. OPD Appointments & Consultations
      const { data: opdData } = await supabase
        .from("opd_appointments")
        .select("*")
        .eq("patient_id", patientRecord.id);

      if (opdData) {
        opdData.forEach((o) =>
          evts.push({
            id: `opd-${o.id}`,
            date: o.visit_date || o.created_at,
            type: "opd",
            title: `OPD Consultation (Token #${o.token_number || "-"})`,
            desc: `Consulted Dr. ${o.doctor_name || "Doctor"} for ${o.symptoms || "general consultation"}. Status: ${o.status}`
          })
        );
      }

      // 2. IPD Admissions
      const { data: ipdData } = await supabase
        .from("ipd_admissions")
        .select("*")
        .eq("patient_id", patientRecord.id);

      if (ipdData) {
        ipdData.forEach((i) =>
          evts.push({
            id: `ipd-${i.id}`,
            date: i.admission_date || i.created_at,
            type: "ipd",
            title: `IPD Admission (Bed ${i.bed_number || "Ward"})`,
            desc: `Admitted under Dr. ${i.doctor_name || i.attending_doctor || "Doctor"}. Diagnosis: ${i.diagnosis || i.reason_for_admission || "Inpatient Care"}. Status: ${i.status}`
          })
        );
      }

      // 3. ICU Admissions
      const { data: icuData } = await supabase
        .from("icu_patients")
        .select("*")
        .eq("patient_id", patientRecord.id);

      if (icuData) {
        icuData.forEach((ic) =>
          evts.push({
            id: `icu-${ic.id}`,
            date: ic.admission_date || ic.created_at,
            type: "icu",
            title: `ICU Critical Care (Bed ${ic.bed_number})`,
            desc: `Admitted under Dr. ${ic.doctor_name}. Diagnosis: ${ic.diagnosis}. Status: ${ic.status}${ic.bp ? ` | Vitals: BP ${ic.bp}` : ""}`
          })
        );
      }
    } catch (err) {
      console.error("Error fetching patient timeline:", err);
    }

    // Sort descending by date
    evts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTimeline(evts);
    setLoading(false);
  };

  const searchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setPatient(null);
    setCandidatePatients([]);
    setTimeline([]);

    const searchVal = searchQuery.trim();
    // Normalize patient code if user prefixed with PID-
    const cleanCode = searchVal.toUpperCase().startsWith("PID-")
      ? searchVal.substring(4)
      : searchVal;

    try {
      // Fetch patients matching phone or name
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`phone.eq.${searchVal},name.ilike.%${searchVal}%`);

      const results: EMRPatient[] = (data || []) as EMRPatient[];

      // If no match by phone/name, or if search resembles a Patient ID code, check ID prefix
      if (cleanCode.length >= 4) {
        const { data: allPatients } = await supabase.from("patients").select("*").limit(200);
        if (allPatients) {
          const idMatches = allPatients.filter((p) => {
            const pid = getPatientIdentifier(p).toUpperCase();
            return (
              pid.includes(searchVal.toUpperCase()) ||
              p.id.replace(/-/g, "").toUpperCase().startsWith(cleanCode.toUpperCase())
            );
          });
          // Merge unique matches
          const seen = new Set(results.map((r) => r.id));
          idMatches.forEach((m) => {
            if (!seen.has(m.id)) {
              results.push(m as EMRPatient);
            }
          });
        }
      }

      if (error && results.length === 0) {
        alert("Search failed: " + error.message);
        setLoading(false);
        return;
      }

      if (results.length === 0) {
        alert("No patient found with ID, name, or phone: " + searchVal);
        setLoading(false);
        return;
      }

      if (results.length === 1) {
        // Exactly one patient found — immediately show their journey
        await fetchPatientTimeline(results[0]);
      } else {
        // Multiple patients match (e.g. family sharing a phone number or common name)
        setCandidatePatients(results);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error searching patient");
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "opd": return <Stethoscope size={20} color="#0ea5e9" />;
      case "ipd": return <Activity size={20} color="#f59e0b" />;
      case "icu": return <ShieldAlert size={20} color="#dc2626" />;
      case "lab": return <FlaskConical size={20} color="#8b5cf6" />;
      case "pharmacy": return <Pill size={20} color="#10b981" />;
      default: return <Calendar size={20} color="#64748b" />;
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: "#0c4a6e" }}>
        Electronic Medical Record (EMR)
      </h2>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Search unified patient journey across OPD, IPD, and ICU using Unique Patient ID, UHID, or Mobile Number.
      </p>

      {/* Search Bar */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <form onSubmit={searchPatient} style={{ display: "flex", gap: 10 }}>
          <input
            style={{ flex: 1, padding: "12px 16px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14 }}
            placeholder="Search by Unique Patient ID (e.g. PID-A7B2C9), UHID, Phone Number, or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            style={{
              background: "#0ea5e9",
              color: "white",
              border: "none",
              padding: "0 24px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            <Search size={18} /> Search EMR
          </button>
        </form>
      </div>

      {loading && <p style={{ color: "#64748b" }}>Searching records & loading timeline...</p>}

      {/* Multiple Patient Disambiguation Panel */}
      {candidatePatients.length > 1 && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <UserCheck size={20} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>
              Multiple Patients Found ({candidatePatients.length})
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
            Multiple members share this contact or name. Select the exact patient to view their distinct medical records:
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {candidatePatients.map((p) => (
              <div
                key={p.id}
                onClick={() => fetchPatientTimeline(p)}
                style={{
                  background: "white",
                  padding: "14px 18px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong style={{ fontSize: 16, color: "#1e293b" }}>{p.name}</strong>
                    <span
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace"
                      }}
                    >
                      {getPatientIdentifier(p)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    Age: {p.age || "—"} | Gender: {p.gender || "—"} | Phone: {p.phone || "—"}
                  </div>
                </div>

                <button
                  style={{
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  View Journey →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient EMR Timeline & Profile */}
      {patient && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Timeline */}
          <div style={{ flex: 1, minWidth: 320, background: "white", padding: 24, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Patient Medical Journey</h3>
              <span style={{ fontSize: 13, color: "#64748b" }}>{timeline.length} event(s) recorded</span>
            </div>

            {timeline.length === 0 ? (
              <p style={{ color: "#64748b" }}>No clinical records found for this patient yet.</p>
            ) : (
              <div style={{ position: "relative", borderLeft: "2px solid #e2e8f0", marginLeft: 10, paddingLeft: 20 }}>
                {timeline.map((item) => (
                  <div key={item.id} style={{ marginBottom: 24, position: "relative" }}>
                    <div style={{ position: "absolute", left: -32, top: 0, background: "white", border: "2px solid #e2e8f0", borderRadius: "50%", padding: 4 }}>
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()}</span>
                      <h4 style={{ margin: "4px 0", fontSize: 15, color: "#1e293b" }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Card */}
          <div style={{ width: 300, background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e0f2fe", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
              {patient.name?.charAt(0)}
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, color: "#0f172a" }}>{patient.name}</h3>
            
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  display: "inline-block"
                }}
              >
                {getPatientIdentifier(patient)}
              </span>
            </div>

            <div style={{ display: "grid", gap: 12, fontSize: 14, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <div>
                <strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Phone</strong>
                {patient.phone || "No phone provided"}
              </div>
              <div>
                <strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Age / Gender</strong>
                {patient.age ? `${patient.age} years` : "—"} / {patient.gender || "—"}
              </div>
              {patient.blood_group && (
                <div>
                  <strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Blood Group</strong>
                  {patient.blood_group}
                </div>
              )}
              {patient.address && (
                <div>
                  <strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Address</strong>
                  {patient.address}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
