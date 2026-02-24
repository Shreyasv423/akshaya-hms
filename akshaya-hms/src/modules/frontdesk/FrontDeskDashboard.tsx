import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../services/supabase";

import PatientForm from "../patients/PatientForm";
import AppointmentForm from "../opd/AppointmentForm";
import AppointmentList from "../opd/AppointmentList";

type Patient = {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone?: string;
};

type Appointment = {
    id: string;
    patient_name: string;
    doctor_name: string;
    token_number: number;
    status: string;
};

export default function FrontDeskDashboard() {
    const [activeTab, setActiveTab] = useState<"patients" | "opd">("patients");

    // Patient State
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchPatient, setSearchPatient] = useState("");
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);

    // OPD State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingOpd, setLoadingOpd] = useState(false);
    const [showOpdForm, setShowOpdForm] = useState(false);
    const [prefilledPatientId, setPrefilledPatientId] = useState<string | null>(null);

    useEffect(() => {
        fetchPatients();
        fetchAppointments();
    }, []);

    const fetchPatients = async () => {
        setLoadingPatients(true);
        const { data } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
        setPatients(data || []);
        setLoadingPatients(false);
    };

    const fetchAppointments = async () => {
        setLoadingOpd(true);
        const today = new Date().toISOString().split("T")[0];
        const { data } = await supabase
            .from("opd_appointments")
            .select("*")
            .eq("visit_date", today)
            .order("token_number", { ascending: true });
        setAppointments(data || []);
        setLoadingOpd(false);
    };

    const handleBookAppointment = (patientId: string) => {
        setPrefilledPatientId(patientId);
        setShowOpdForm(true);
        setActiveTab("opd");
    };

    const filteredPatients = patients.filter(p =>
        !searchPatient ||
        p.name.toLowerCase().includes(searchPatient.toLowerCase()) ||
        p.phone?.includes(searchPatient)
    );

    return (
        <div style={container}>
            {/* Header */}
            <div style={headerRow}>
                <div>
                    <h2 style={title}>Front Desk</h2>
                    <p style={subtitle}>Manage Patients and OPD Appointments</p>
                </div>
            </div>

            {/* Modern Tabs */}
            <div style={statsGrid}>
                <div style={{ ...statCard, borderTop: "3px solid #0ea5e9" }}>
                    <div style={statLabel}>Total Patients</div>
                    <div style={statValue}>{patients.length}</div>
                </div>
                <div style={{ ...statCard, borderTop: "3px solid #f59e0b" }}>
                    <div style={statLabel}>Appointments Today</div>
                    <div style={statValue}>{appointments.length}</div>
                </div>
                <div style={{ ...statCard, borderTop: "3px solid #8b5cf6" }}>
                    <div style={statLabel}>Waiting / Consulting</div>
                    <div style={statValue}>{appointments.filter(a => a.status !== "Completed").length}</div>
                </div>
                <div style={{ ...statCard, borderTop: "3px solid #10b981" }}>
                    <div style={statLabel}>Completed Today</div>
                    <div style={statValue}>{appointments.filter(a => a.status === "Completed").length}</div>
                </div>
            </div>

            <div style={tabContainer}>
                <div style={tabBg}>
                    <button
                        style={activeTab === "patients" ? activeTabStyle : inactiveTabStyle}
                        onClick={() => setActiveTab("patients")}
                    >
                        👥 Patient Directory
                    </button>
                    <button
                        style={activeTab === "opd" ? activeTabStyle : inactiveTabStyle}
                        onClick={() => setActiveTab("opd")}
                    >
                        🩺 Today's OPD ({appointments.length})
                    </button>
                </div>
            </div>

            {/* Tab Content with Framer Motion transitions */}
            <AnimatePresence mode="wait">
                {activeTab === "patients" ? (
                    <motion.div
                        key="patients"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div style={actionRow}>
                            <input
                                style={searchInput}
                                placeholder="🔍 Search patient by name or phone..."
                                value={searchPatient}
                                onChange={e => setSearchPatient(e.target.value)}
                            />
                            <button style={primaryBtn} onClick={() => setShowPatientForm(!showPatientForm)}>
                                {showPatientForm ? "✕ Cancel" : "+ New Patient"}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showPatientForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <PatientForm onAdded={() => { setShowPatientForm(false); fetchPatients(); }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={tableCard}>
                            {loadingPatients ? (
                                <div style={emptyState}>Loading patients...</div>
                            ) : filteredPatients.length === 0 ? (
                                <div style={emptyState}>No patients found.</div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={table}>
                                        <thead>
                                            <tr style={thead}>
                                                <th style={th}>Name</th>
                                                <th style={th}>Age/Gender</th>
                                                <th style={th}>Phone</th>
                                                <th style={th}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPatients.map(p => (
                                                <tr key={p.id} style={tr}>
                                                    <td style={{ ...td, fontWeight: 600 }}>{p.name}</td>
                                                    <td style={td}>{p.age || "—"} / {p.gender}</td>
                                                    <td style={{ ...td, color: "#64748b" }}>{p.phone || "—"}</td>
                                                    <td style={td}>
                                                        <button style={actionBtn} onClick={() => handleBookAppointment(p.id)}>
                                                            Book OPD
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="opd"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div style={actionRow}>
                            <div>{/* Spacer */}</div>
                            <button style={primaryBtn} onClick={() => { setShowOpdForm(!showOpdForm); setPrefilledPatientId(null); }}>
                                {showOpdForm ? "✕ Cancel" : "+ Book Walk-in"}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showOpdForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <AppointmentForm onSuccess={() => { setShowOpdForm(false); fetchAppointments(); }} initialPatientId={prefilledPatientId} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {loadingOpd ? (
                            <div style={emptyState}>Loading appointments...</div>
                        ) : (
                            <AppointmentList
                                appointments={appointments as any}
                                refresh={fetchAppointments}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* 🎨 Premium Styles */
const container: React.CSSProperties = { paddingBottom: 40 };
const headerRow: React.CSSProperties = { marginBottom: 24 };
const title: React.CSSProperties = { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" };
const subtitle: React.CSSProperties = { fontSize: 14, color: "#64748b", margin: 0 };

const statsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 30
};
const statCard: React.CSSProperties = {
    background: "white",
    padding: "18px 24px",
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
};
const statLabel: React.CSSProperties = {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    marginBottom: 6
};
const statValue: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a"
};

const tabContainer: React.CSSProperties = { marginBottom: 24, display: "flex" };
const tabBg: React.CSSProperties = {
    background: "#f1f5f9",
    padding: 4,
    borderRadius: 12,
    display: "flex",
    gap: 4
};
const baseTab: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease"
};
const activeTabStyle: React.CSSProperties = { ...baseTab, background: "white", color: "#0ea5e9", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const inactiveTabStyle: React.CSSProperties = { ...baseTab, background: "transparent", color: "#64748b" };

const actionRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" };
const searchInput: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    width: "100%",
    maxWidth: 320,
    fontSize: 14,
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
};
const primaryBtn: React.CSSProperties = {
    padding: "10px 20px",
    background: "#0ea5e9",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
    transition: "transform 0.1s"
};
const actionBtn: React.CSSProperties = {
    padding: "6px 12px",
    background: "#e0f2fe",
    color: "#0284c7",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer"
};

const tableCard: React.CSSProperties = {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    overflow: "hidden"
};
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 600 };
const thead: React.CSSProperties = { background: "#fafafa", borderBottom: "1px solid #f1f5f9" };
const th: React.CSSProperties = { padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" };
const tr: React.CSSProperties = { borderBottom: "1px solid #f8fafc", transition: "background 0.2s" };
const td: React.CSSProperties = { padding: "14px 20px", fontSize: 14, color: "#334155" };

const emptyState: React.CSSProperties = { textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 15 };
