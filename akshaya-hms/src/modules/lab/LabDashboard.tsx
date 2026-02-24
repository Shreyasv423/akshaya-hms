import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";

type LabOrder = {
    id: string;
    patient_name: string;
    test_name: string;
    ordered_by: string;
    status: "Pending" | "Processing" | "Completed";
    result: string | null;
    result_notes: string | null;
    created_at: string;
};

const TEST_LIST = [
    "Complete Blood Count (CBC)",
    "Blood Sugar (Fasting)",
    "Blood Sugar (Random)",
    "HbA1c",
    "Lipid Profile",
    "Liver Function Test (LFT)",
    "Kidney Function Test (KFT)",
    "Thyroid Profile (TSH)",
    "Urine Routine",
    "Malaria Antigen",
    "Dengue NS1 Antigen",
    "COVID-19 Antigen",
    "X-Ray",
    "ECG",
    "Urine Culture",
    "Blood Culture",
    "Stool Routine",
    "Pregnancy Test (β-hCG)",
    "PT/INR",
    "ESR",
];

export default function LabDashboard() {
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

    // Form state
    const [patientId, setPatientId] = useState("");
    const [testName, setTestName] = useState("");
    const [orderedBy, setOrderedBy] = useState("");
    const [saving, setSaving] = useState(false);

    // Result entry state
    const [result, setResult] = useState("");
    const [resultNotes, setResultNotes] = useState("");
    const [savingResult, setSavingResult] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchPatients();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("lab_orders")
            .select("*")
            .order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const fetchPatients = async () => {
        const { data } = await supabase.from("patients").select("id, name").order("name");
        setPatients(data || []);
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || !testName || !orderedBy) return;
        setSaving(true);
        const patient = patients.find(p => p.id === patientId);
        const { error } = await supabase.from("lab_orders").insert({
            patient_id: patientId,
            patient_name: patient?.name || "",
            test_name: testName,
            ordered_by: orderedBy,
            status: "Pending",
        });
        setSaving(false);
        if (!error) {
            setPatientId(""); setTestName(""); setOrderedBy("");
            setShowForm(false);
            fetchOrders();
        } else {
            alert(error.message);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("lab_orders").update({ status }).eq("id", id);
        fetchOrders();
    };

    const saveResult = async () => {
        if (!selectedOrder || !result.trim()) return;
        setSavingResult(true);
        await supabase.from("lab_orders").update({
            result: result.trim(),
            result_notes: resultNotes.trim() || null,
            status: "Completed",
        }).eq("id", selectedOrder.id);
        setSavingResult(false);
        setSelectedOrder(null);
        setResult(""); setResultNotes("");
        fetchOrders();
    };

    const filtered = useMemo(() => {
        return orders.filter(o => {
            const matchSearch = !search || o.patient_name.toLowerCase().includes(search.toLowerCase()) || o.test_name.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === "All" || o.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [orders, search, filterStatus]);

    const pendingCount = orders.filter(o => o.status === "Pending").length;
    const processingCount = orders.filter(o => o.status === "Processing").length;
    const completedCount = orders.filter(o => o.status === "Completed").length;

    return (
        <div>
            {/* Header */}
            <div style={pageHeader}>
                <div>
                    <h2 style={heading}>Laboratory</h2>
                    <p style={sub}>Manage lab test orders and results</p>
                </div>
                <button style={primaryBtn} onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Cancel" : "+ New Test Order"}
                </button>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
                <StatCard label="Total Orders" value={orders.length} color="#0ea5e9" />
                <StatCard label="Pending" value={pendingCount} color="#f59e0b" />
                <StatCard label="Processing" value={processingCount} color="#8b5cf6" />
                <StatCard label="Completed" value={completedCount} color="#10b981" />
            </div>

            {/* New Order Form */}
            {showForm && (
                <div style={formCard}>
                    <h3 style={formTitle}>🧪 New Lab Test Order</h3>
                    <form onSubmit={handleCreateOrder} style={formGrid}>
                        <div style={field}>
                            <label style={lbl}>Patient</label>
                            <select style={inp} value={patientId} onChange={e => setPatientId(e.target.value)} required>
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={field}>
                            <label style={lbl}>Test Name</label>
                            <select style={inp} value={testName} onChange={e => setTestName(e.target.value)} required>
                                <option value="">Select Test</option>
                                {TEST_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={field}>
                            <label style={lbl}>Ordered By (Doctor)</label>
                            <input style={inp} placeholder="Dr. Name" value={orderedBy} onChange={e => setOrderedBy(e.target.value)} required />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" style={primaryBtn} disabled={saving}>
                                {saving ? "Creating..." : "Create Order"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={filterRow}>
                <input style={searchInp} placeholder="🔍  Search patient or test..." value={search} onChange={e => setSearch(e.target.value)} />
                <div style={pillGroup}>
                    {["All", "Pending", "Processing", "Completed"].map(s => (
                        <button key={s} style={pill(filterStatus === s)} onClick={() => setFilterStatus(s)}>{s}</button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div style={emptyBox}>Loading orders...</div>
            ) : filtered.length === 0 ? (
                <div style={emptyBox}>
                    <p style={{ fontSize: 32 }}>🧪</p>
                    <p style={{ color: "#64748b" }}>No test orders found.</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto", background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                    <table style={tbl}>
                        <thead>
                            <tr style={thead}>
                                <th style={th}>Patient</th>
                                <th style={th}>Test</th>
                                <th style={th}>Ordered By</th>
                                <th style={th}>Date</th>
                                <th style={th}>Status</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => (
                                <tr key={o.id}>
                                    <td style={td}>{o.patient_name}</td>
                                    <td style={{ ...td, fontWeight: 500 }}>{o.test_name}</td>
                                    <td style={{ ...td, color: "#64748b" }}>{o.ordered_by}</td>
                                    <td style={{ ...td, color: "#64748b", fontSize: 13 }}>
                                        {new Date(o.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    <td style={td}>
                                        <span style={statusBadge(o.status)}>{o.status}</span>
                                    </td>
                                    <td style={td}>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            {o.status === "Pending" && (
                                                <button style={actionBtn("#8b5cf6")} onClick={() => updateStatus(o.id, "Processing")}>
                                                    Process
                                                </button>
                                            )}
                                            {o.status === "Processing" && (
                                                <button style={actionBtn("#10b981")} onClick={() => { setSelectedOrder(o); setResult(""); setResultNotes(""); }}>
                                                    Enter Result
                                                </button>
                                            )}
                                            {o.status === "Completed" && o.result && (
                                                <button style={actionBtn("#0ea5e9")} onClick={() => setSelectedOrder(o)}>
                                                    View Result
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Result Modal */}
            {selectedOrder && (
                <div style={overlay}>
                    <div style={modal}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, color: "#0c4a6e" }}>
                                {selectedOrder.status === "Completed" ? "🔬 Test Result" : "📝 Enter Result"}
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} style={closeBtn}>✕</button>
                        </div>

                        <div style={{ background: "#f0f9ff", padding: "12px 16px", borderRadius: 10, marginBottom: 16 }}>
                            <div style={{ fontWeight: 600 }}>{selectedOrder.test_name}</div>
                            <div style={{ fontSize: 13, color: "#64748b" }}>Patient: {selectedOrder.patient_name} | Dr. {selectedOrder.ordered_by}</div>
                        </div>

                        {selectedOrder.status === "Completed" ? (
                            <div>
                                <div style={resultBox}><strong>Result:</strong> {selectedOrder.result}</div>
                                {selectedOrder.result_notes && (
                                    <div style={{ ...resultBox, marginTop: 10, background: "#f8fafc" }}>
                                        <strong>Notes:</strong> {selectedOrder.result_notes}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: 12 }}>
                                <div style={field}>
                                    <label style={lbl}>Result *</label>
                                    <textarea style={{ ...inp, height: 80, resize: "vertical" }} placeholder="e.g., Hb: 12.5 g/dL, WBC: 8000 /μL..." value={result} onChange={e => setResult(e.target.value)} />
                                </div>
                                <div style={field}>
                                    <label style={lbl}>Additional Notes</label>
                                    <textarea style={{ ...inp, height: 60, resize: "vertical" }} placeholder="Observations, recommendations..." value={resultNotes} onChange={e => setResultNotes(e.target.value)} />
                                </div>
                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                    <button style={cancelBtn} onClick={() => setSelectedOrder(null)}>Cancel</button>
                                    <button style={primaryBtn} onClick={saveResult} disabled={savingResult || !result.trim()}>
                                        {savingResult ? "Saving..." : "Save & Complete"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ ...cardBase, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        </div>
    );
}

/* ── Styles ── */
const pageHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 };
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 14, color: "#64748b" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 };
const cardBase: React.CSSProperties = { background: "white", padding: "16px 20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
const formCard: React.CSSProperties = { background: "white", padding: 24, borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 24 };
const formTitle: React.CSSProperties = { margin: "0 0 16px", color: "#0c4a6e", fontSize: 16, fontWeight: 600 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inp: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit" };
const filterRow: React.CSSProperties = { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" };
const searchInp: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, flex: "1 1 240px", minWidth: 200 };
const pillGroup: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const pill = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px", borderRadius: 20, border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "#0ea5e9" : "white", color: active ? "white" : "#64748b",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400
});
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 640 };
const thead: React.CSSProperties = { background: "#f0f9ff" };
const th: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#0369a1", borderBottom: "1px solid #e0f2fe", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 14 };
const primaryBtn: React.CSSProperties = { padding: "10px 20px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 };
const cancelBtn: React.CSSProperties = { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 500, cursor: "pointer" };
const actionBtn = (bg: string): React.CSSProperties => ({ padding: "5px 12px", background: bg, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 });
const emptyBox: React.CSSProperties = { textAlign: "center", padding: 60, background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" };
const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 };
const modal: React.CSSProperties = { background: "white", padding: 28, borderRadius: 16, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" };
const closeBtn: React.CSSProperties = { background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" };
const resultBox: React.CSSProperties = { padding: "14px 16px", background: "#dcfce7", borderRadius: 10, color: "#166534", lineHeight: 1.6 };
const statusBadge = (status: string): React.CSSProperties => ({
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: status === "Pending" ? "#fef3c7" : status === "Processing" ? "#ede9fe" : "#dcfce7",
    color: status === "Pending" ? "#b45309" : status === "Processing" ? "#6d28d9" : "#166534"
});
