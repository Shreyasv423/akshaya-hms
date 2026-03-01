import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import IpdBillingModal from "../billing/IpdBillingModal";

type IcuPatient = {
    id: string;
    patient_id: string;
    patient_name: string;
    age: number | null;
    gender: string;
    bed_id: string;
    bed_number: string;
    doctor_name: string;
    diagnosis: string;
    bp: string | null;
    pulse: string | null;
    spo2: string | null;
    temp: string | null;
    status: "Critical" | "Stable" | "Improving";
    admission_date: string;
    created_at: string;
};

export default function IcuDashboard() {
    const [patients, setPatients] = useState<IcuPatient[]>([]);
    const [allPatients, setAllPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [beds, setBeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<IcuPatient | null>(null);
    const [billingPatient, setBillingPatient] = useState<IcuPatient | null>(null);
    const [saving, setSaving] = useState(false);

    // Admission form
    const [form, setForm] = useState({
        patient_id: "", doctor_name: "", bed_id: "", bed_number: "",
        diagnosis: "", status: "Critical"
    });

    // Vitals form
    const [vitals, setVitals] = useState({ bp: "", pulse: "", spo2: "", temp: "" });
    const [savingVitals, setSavingVitals] = useState(false);

    useEffect(() => {
        fetchIcuPatients();
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        const [{ data: p }, { data: d }, { data: b }] = await Promise.all([
            supabase.from("patients").select("id, name, age, gender").order("name"),
            supabase.from("doctors").select("id, name").eq("is_active", true).order("name"),
            supabase.from("beds").select("id, bed_number, ward").eq("is_occupied", false)
        ]);
        setAllPatients(p || []);
        setDoctors(d || []);
        setBeds((b || []).filter(bed => bed.ward.toLowerCase().includes("icu")));
    };

    const fetchIcuPatients = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("icu_patients")
            .select("*")
            .order("created_at", { ascending: false });
        setPatients((data || []) as IcuPatient[]);
        setLoading(false);
    };

    const handleAdmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.patient_id || !form.doctor_name || !form.bed_id || !form.diagnosis) return;
        setSaving(true);
        const patient = allPatients.find(p => p.id === form.patient_id);
        const { error } = await supabase.from("icu_patients").insert({
            patient_id: form.patient_id,
            patient_name: patient?.name,
            age: patient?.age ?? null,
            gender: patient?.gender ?? "",
            doctor_name: form.doctor_name,
            bed_id: form.bed_id,
            bed_number: form.bed_number,
            diagnosis: form.diagnosis,
            status: form.status,
            admission_date: new Date().toISOString().split("T")[0],
        });

        if (!error) {
            await supabase.from("beds").update({ is_occupied: true }).eq("id", form.bed_id);
            setForm({ patient_id: "", doctor_name: "", bed_id: "", bed_number: "", diagnosis: "", status: "Critical" });
            setShowForm(false);
            fetchIcuPatients();
            fetchDropdownData();
        } else {
            alert(error.message);
        }
        setSaving(false);
    };

    const updateVitals = async () => {
        if (!selectedPatient) return;
        setSavingVitals(true);
        await supabase.from("icu_patients").update({
            bp: vitals.bp || null,
            pulse: vitals.pulse || null,
            spo2: vitals.spo2 || null,
            temp: vitals.temp || null,
        }).eq("id", selectedPatient.id);
        setSavingVitals(false);
        setSelectedPatient(null);
        fetchIcuPatients();
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("icu_patients").update({ status }).eq("id", id);
        fetchIcuPatients();
    };

    const discharge = async (patient: IcuPatient) => {
        setBillingPatient({ ...patient, ward: "ICU" } as any);
    };

    const handleDischargeSuccess = async () => {
        if (billingPatient) {
            await supabase.from("icu_patients").delete().eq("id", billingPatient.id);
            fetchIcuPatients();
            setBillingPatient(null);
        }
    };

    const critical = patients.filter(p => p.status === "Critical").length;
    const stable = patients.filter(p => p.status === "Stable").length;
    const improving = patients.filter(p => p.status === "Improving").length;

    return (
        <div>
            {/* Header */}
            <div style={pageHeader}>
                <div>
                    <h2 style={heading}>ICU Management</h2>
                    <p style={sub}>Critical care monitoring and bed management</p>
                </div>
                <button style={primaryBtn} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Cancel" : "+ Admit to ICU"}
                </button>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
                <StatCard label="Total ICU Patients" value={patients.length} color="#0ea5e9" />
                <StatCard label="Critical" value={critical} color="#dc2626" />
                <StatCard label="Stable" value={stable} color="#f59e0b" />
                <StatCard label="Improving" value={improving} color="#10b981" />
            </div>

            {/* Admit Form */}
            {showForm && (
                <div style={formCard}>
                    <h3 style={formTitle}>🏥 Admit to ICU</h3>
                    <form onSubmit={handleAdmit} style={formGrid}>
                        <div style={fieldStyle}>
                            <label style={lbl}>Patient</label>
                            <select style={inp} value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })} required>
                                <option value="">Select Patient</option>
                                {allPatients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={lbl}>ICU Bed Number</label>
                            <select style={inp} value={form.bed_id} onChange={e => {
                                const bed = beds.find(b => b.id === e.target.value);
                                setForm({ ...form, bed_id: e.target.value, bed_number: bed?.bed_number || "" });
                            }} required>
                                <option value="">Select Bed</option>
                                {beds.map(b => <option key={b.id} value={b.id}>Bed {b.bed_number} ({b.ward})</option>)}
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={lbl}>Doctor In-Charge</label>
                            <select style={inp} value={form.doctor_name} onChange={e => setForm({ ...form, doctor_name: e.target.value })} required>
                                <option value="">Select Doctor</option>
                                {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={lbl}>Initial Status</label>
                            <select style={inp} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option>Critical</option>
                                <option>Stable</option>
                                <option>Improving</option>
                            </select>
                        </div>
                        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                            <label style={lbl}>Diagnosis / Reason for ICU</label>
                            <input style={inp} placeholder="Primary diagnosis" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} required />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <button type="submit" style={primaryBtn} disabled={saving}>
                                {saving ? "Admitting..." : "Admit Patient"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Patient Cards */}
            {loading ? (
                <div style={emptyBox}>Loading ICU patients...</div>
            ) : patients.length === 0 ? (
                <div style={emptyBox}>
                    <p style={{ fontSize: 32 }}>🏥</p>
                    <p style={{ color: "#64748b" }}>No patients currently in ICU.</p>
                </div>
            ) : (
                <div style={cardGrid}>
                    {patients.map(p => (
                        <div key={p.id} style={{ ...icuCard, borderTop: `4px solid ${statusColor(p.status)}` }}>
                            <div style={cardHeader}>
                                <div>
                                    <div style={patientName}>{p.patient_name}</div>
                                    <div style={patientSub}>
                                        {p.age ? `Age: ${p.age}` : ""}{p.age && p.gender ? " | " : ""}{p.gender}
                                    </div>
                                </div>
                                <span style={statusBadge(p.status)}>{p.status}</span>
                            </div>

                            <div style={infoGrid}>
                                <InfoItem icon="🛏️" label="Bed" value={p.bed_number} />
                                <InfoItem icon="👨‍⚕️" label="Doctor" value={p.doctor_name} />
                                <InfoItem icon="🗓️" label="Admitted" value={p.admission_date} />
                                <InfoItem icon="🩺" label="Diagnosis" value={p.diagnosis} />
                            </div>

                            {/* Vitals */}
                            {(p.bp || p.pulse || p.spo2 || p.temp) && (
                                <div style={vitalsRow}>
                                    {p.bp && <VitalChip icon="💉" label="BP" value={p.bp} />}
                                    {p.pulse && <VitalChip icon="❤️" label="Pulse" value={`${p.pulse} bpm`} />}
                                    {p.spo2 && <VitalChip icon="🫁" label="SpO₂" value={`${p.spo2}%`} />}
                                    {p.temp && <VitalChip icon="🌡️" label="Temp" value={`${p.temp}°F`} />}
                                </div>
                            )}

                            <div style={actionRow}>
                                <button style={smBtn("#8b5cf6")} onClick={() => {
                                    setSelectedPatient(p);
                                    setVitals({ bp: p.bp || "", pulse: p.pulse || "", spo2: p.spo2 || "", temp: p.temp || "" });
                                }}>
                                    Update Vitals
                                </button>
                                <select style={smSelect} value={p.status} onChange={e => updateStatus(p.id, e.target.value)}>
                                    <option>Critical</option>
                                    <option>Stable</option>
                                    <option>Improving</option>
                                </select>
                                <button style={smBtn("#dc2626")} onClick={() => discharge(p)}>
                                    Bill & Discharge
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vitals Modal */}
            {selectedPatient && (
                <div style={overlay}>
                    <div style={modal}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, color: "#0c4a6e" }}>Update Vitals — {selectedPatient.patient_name}</h3>
                            <button onClick={() => setSelectedPatient(null)} style={closeBtnStyle}>✕</button>
                        </div>
                        <div style={formGrid}>
                            <div style={fieldStyle}>
                                <label style={lbl}>Blood Pressure (mmHg)</label>
                                <input style={inp} placeholder="e.g., 120/80" value={vitals.bp} onChange={e => setVitals({ ...vitals, bp: e.target.value })} />
                            </div>
                            <div style={fieldStyle}>
                                <label style={lbl}>Pulse (bpm)</label>
                                <input style={inp} placeholder="e.g., 72" value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })} />
                            </div>
                            <div style={fieldStyle}>
                                <label style={lbl}>SpO₂ (%)</label>
                                <input style={inp} placeholder="e.g., 98" value={vitals.spo2} onChange={e => setVitals({ ...vitals, spo2: e.target.value })} />
                            </div>
                            <div style={fieldStyle}>
                                <label style={lbl}>Temperature (°F)</label>
                                <input style={inp} placeholder="e.g., 98.6" value={vitals.temp} onChange={e => setVitals({ ...vitals, temp: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                            <button style={cancelBtn} onClick={() => setSelectedPatient(null)}>Cancel</button>
                            <button style={primaryBtn} onClick={updateVitals} disabled={savingVitals}>
                                {savingVitals ? "Saving..." : "Save Vitals"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Modal */}
            {billingPatient && (
                <IpdBillingModal
                    admission={billingPatient}
                    onClose={() => setBillingPatient(null)}
                    onSuccess={handleDischargeSuccess}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ background: "white", padding: "16px 20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div style={{ fontSize: 13 }}>
            <span style={{ color: "#94a3b8" }}>{icon} {label}: </span>
            <span style={{ color: "#334155", fontWeight: 500 }}>{value}</span>
        </div>
    );
}

function VitalChip({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div style={{ background: "#f0f9ff", padding: "6px 12px", borderRadius: 8, fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
            <span>{icon}</span>
            <span style={{ color: "#64748b" }}>{label}:</span>
            <span style={{ fontWeight: 600, color: "#0369a1" }}>{value}</span>
        </div>
    );
}

const statusColor = (s: string) => s === "Critical" ? "#dc2626" : s === "Stable" ? "#f59e0b" : "#10b981";
const statusBadge = (s: string): React.CSSProperties => ({
    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    background: s === "Critical" ? "#fee2e2" : s === "Stable" ? "#fef3c7" : "#dcfce7",
    color: s === "Critical" ? "#dc2626" : s === "Stable" ? "#b45309" : "#166534",
    whiteSpace: "nowrap"
});

const pageHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 };
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 14, color: "#64748b" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 };
const formCard: React.CSSProperties = { background: "white", padding: 24, borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 24 };
const formTitle: React.CSSProperties = { margin: "0 0 16px", color: "#0c4a6e", fontSize: 16, fontWeight: 600 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inp: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit" };
const cardGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 };
const icuCard: React.CSSProperties = { background: "white", borderRadius: 14, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" };
const cardHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 };
const patientName: React.CSSProperties = { fontWeight: 700, fontSize: 16, color: "#0c4a6e" };
const patientSub: React.CSSProperties = { fontSize: 13, color: "#64748b", marginTop: 2 };
const infoGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 };
const vitalsRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 };
const actionRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: 14 };
const smBtn = (bg: string): React.CSSProperties => ({ padding: "6px 12px", background: bg, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 });
const smSelect: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer" };
const primaryBtn: React.CSSProperties = { padding: "10px 20px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 };
const cancelBtn: React.CSSProperties = { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 500, cursor: "pointer" };
const emptyBox: React.CSSProperties = { textAlign: "center", padding: 60, background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" };
const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 };
const modal: React.CSSProperties = { background: "white", padding: 28, borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };
const closeBtnStyle: React.CSSProperties = { background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" };
