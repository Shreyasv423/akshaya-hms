import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";

type SurgerySchedule = {
  id: string;
  patient_name: string;
  surgeon_name: string;
  surgery_type: string;
  ot_room: string;
  scheduled_time: string;
  status: "Scheduled" | "In Progress" | "Completed";
};

export default function OtDashboard() {
  const [surgeries, setSurgeries] = useState<SurgerySchedule[]>([]);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [surgeonName, setSurgeonName] = useState("");
  const [surgeryType, setSurgeryType] = useState("");
  const [otRoom, setOtRoom] = useState("OT-1");
  const [scheduledTime, setScheduledTime] = useState("");

  const fetchSurgeries = async () => {
    setLoading(true);
    // Note: requires `ot_schedules` table in supabase
    const { data, error } = await supabase
      .from("ot_schedules")
      .select("*")
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setSurgeries(data as SurgerySchedule[]);
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("id, name").order("name");
    if (data) setPatients(data);
  };

  useEffect(() => {
    fetchSurgeries();
    fetchPatients();
  }, []);

  const handleScheduleId = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("ot_schedules").insert([
      {
        patient_name: patientName,
        surgeon_name: surgeonName,
        surgery_type: surgeryType,
        ot_room: otRoom,
        scheduled_time: scheduledTime,
        status: "Scheduled"
      }
    ]);

    if (!error) {
      setShowModal(false);
      setPatientName("");
      setSurgeonName("");
      setSurgeryType("");
      setScheduledTime("");
      fetchSurgeries();
    } else {
      alert("Please ensure the 'ot_schedules' table exists.");
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    let nextStatus = "In Progress";
    if (currentStatus === "In Progress") nextStatus = "Completed";
    if (currentStatus === "Completed") return; // cannot update further

    await supabase.from("ot_schedules").update({ status: nextStatus }).eq("id", id);
    fetchSurgeries();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Scheduled': return { bg: '#e0e7ff', text: '#4338ca' };
      case 'In Progress': return { bg: '#fef3c7', text: '#b45309' };
      case 'Completed': return { bg: '#dcfce7', text: '#15803d' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>Operation Theatre</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Manage surgeries and OT allocations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "#0ea5e9", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
        >
          + Schedule Surgery
        </button>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading schedules...</p>
        ) : surgeries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#64748b", fontWeight: 500 }}>No surgeries scheduled.</p>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Requires `ot_schedules` table in Supabase.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Date & Time</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Patient</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Surgeon</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Surgery</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>OT Room</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Status</th>
                <th style={{ padding: "12px 16px", color: "#64748b" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {surgeries.map(surg => (
                <tr key={surg.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px", color: "#0f172a", fontWeight: 500 }}>{new Date(surg.scheduled_time).toLocaleString()}</td>
                  <td style={{ padding: "16px", color: "#475569" }}>{surg.patient_name}</td>
                  <td style={{ padding: "16px", color: "#475569" }}>Dr. {surg.surgeon_name}</td>
                  <td style={{ padding: "16px", color: "#475569" }}>{surg.surgery_type}</td>
                  <td style={{ padding: "16px", color: "#475569", fontWeight: 600 }}>{surg.ot_room}</td>
                  <td style={{ padding: "16px", color: "#475569" }}>
                    <span style={{ background: getStatusColor(surg.status).bg, color: getStatusColor(surg.status).text, padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                      {surg.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    {surg.status !== "Completed" && (
                      <button
                        onClick={() => updateStatus(surg.id, surg.status)}
                        style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569" }}
                      >
                        {surg.status === "Scheduled" ? "Start Surgery" : "Mark Completed"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, width: "100%", maxWidth: 400 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Schedule Surgery</h3>
            <form onSubmit={handleScheduleId}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Patient Name</label>
                <select required value={patientName} onChange={e => setPatientName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "white" }}>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Surgeon Name</label>
                <input required value={surgeonName} onChange={e => setSurgeonName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Procedure / Surgery Type</label>
                <input required value={surgeryType} onChange={e => setSurgeryType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>OT Room</label>
                  <select required value={otRoom} onChange={e => setOtRoom(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "white" }}>
                    <option>OT-1</option>
                    <option>OT-2</option>
                    <option>OT-3</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Date & Time</label>
                  <input required type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#e2e8f0", color: "#334155", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "white", fontWeight: 600, cursor: "pointer" }}>Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
