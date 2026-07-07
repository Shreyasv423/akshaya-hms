import { useState } from "react";
import { supabase } from "../../services/supabase";
import { Search, Activity, Stethoscope, Pill, FlaskConical, Calendar } from "lucide-react";

type EMRPatient = {
  id: string;
  name: string;
  uhid: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  blood_group?: string | null;
  address?: string | null;
};

type TimelineItem = {
  id: string;
  date: string;
  type: "opd" | "ipd" | "lab" | "pharmacy";
  title: string;
  desc: string;
};

export default function EmrDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patient, setPatient] = useState<EMRPatient | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setPatient(null);
    setTimeline([]);

    const searchVal = searchQuery.trim();
    // 1. Search Patient
    const { data: patientData, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .or(`phone.eq.${searchVal},uhid.eq.${searchVal}`);

    if (patientError || !patientData || patientData.length === 0) {
      alert("Patient not found.");
      setLoading(false);
      return;
    }

    const patientRecord = patientData[0] as EMRPatient;
    setPatient(patientRecord);

    // 2. Fetch Timeline Data (OPD, IPD, etc.)
    const evts: TimelineItem[] = [];

    // OPD
    const { data: opdData } = await supabase
      .from("opd_appointments")
      .select("*")
      .eq("patient_id", patientRecord.id);
    
    if (opdData) {
      opdData.forEach(o => evts.push({
        id: `opd-${o.id}`,
        date: o.created_at,
        type: "opd",
        title: "OPD Consultation",
        desc: `Consulted Dr. ${o.doctor_name} for ${o.symptoms || "general visit"}. Status: ${o.status}`
      }));
    }

    // IPD
    const { data: ipdData } = await supabase
      .from("ipd_admissions")
      .select("*")
      .eq("patient_id", patientRecord.id);

    if (ipdData) {
      ipdData.forEach(i => evts.push({
        id: `ipd-${i.id}`,
        date: i.admission_date,
        type: "ipd",
        title: "IPD Admission",
        desc: `Admitted under Dr. ${i.attending_doctor}. Reason: ${i.reason_for_admission}. Status: ${i.status}`
      }));
    }

    // Sort descending
    evts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTimeline(evts);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "opd": return <Stethoscope size={20} color="#0ea5e9" />;
      case "ipd": return <Activity size={20} color="#f59e0b" />;
      case "lab": return <FlaskConical size={20} color="#8b5cf6" />;
      case "pharmacy": return <Pill size={20} color="#10b981" />;
      default: return <Calendar size={20} color="#64748b" />;
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Electronic Medical Record (EMR)</h2>
      <p style={{ color: "#64748b", marginBottom: 24 }}>Search unified patient history across all departments.</p>

      {/* Search Bar */}
      <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: 20 }}>
        <form onSubmit={searchPatient} style={{ display: "flex", gap: 10 }}>
          <input
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
            placeholder="Enter Patient Phone Number or UHID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={{ background: "#0ea5e9", color: "white", border: "none", padding: "0 20px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      {loading && <p style={{ color: "#64748b" }}>Loading timeline...</p>}

      {patient && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Timeline */}
          <div style={{ flex: 1, minWidth: 300, background: "white", padding: 24, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginBottom: 24, fontSize: 18, color: "#0f172a" }}>Patient Journey</h3>
            
            {timeline.length === 0 ? (
              <p style={{ color: "#64748b" }}>No historical records found for this patient.</p>
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
          <div style={{ width: 280, background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e0f2fe", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
              {patient.name?.charAt(0)}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>{patient.name}</h3>
            <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: 14 }}>UHID: {patient.uhid}</p>

            <div style={{ display: "grid", gap: 12, fontSize: 14 }}>
              <div><strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Phone</strong> {patient.phone}</div>
              {patient.age && <div><strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Age/Gender</strong> {patient.age} / {patient.gender || '-'}</div>}
              {patient.blood_group && <div><strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Blood Group</strong> {patient.blood_group}</div>}
              {patient.address && <div><strong style={{ color: "#94a3b8", display: "block", fontSize: 12 }}>Address</strong> {patient.address}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
