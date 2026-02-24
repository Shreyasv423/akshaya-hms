import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";

type Medicine = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    expiry_date: string | null;
    manufacturer: string | null;
    created_at: string;
};

type DispenseRecord = {
    id: string;
    medicine_id: string;
    medicine_name: string;
    patient_name: string;
    quantity_dispensed: number;
    prescribed_by: string;
    dispensed_at: string;
};

const CATEGORIES = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Inhaler", "IV Fluid", "Powder", "Other"];
const UNITS = ["Strips", "Bottles", "Vials", "Tubes", "Packets", "Units", "mL", "mg"];
const LOW_STOCK_THRESHOLD = 20;

export default function PharmacyDashboard() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [dispenseHistory, setDispenseHistory] = useState<DispenseRecord[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<"inventory" | "dispense" | "history">("inventory");
    const [search, setSearch] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDispenseForm, setShowDispenseForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Add medicine form
    const [medForm, setMedForm] = useState({
        name: "", category: "Tablet", quantity: "", unit: "Strips",
        price_per_unit: "", expiry_date: "", manufacturer: ""
    });

    // Dispense form
    const [dispForm, setDispForm] = useState({
        medicine_id: "", patient_id: "", quantity_dispensed: "",
        prescribed_by: ""
    });

    useEffect(() => {
        fetchMedicines();
        fetchDispenseHistory();
        fetchPatients();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        const { data } = await supabase.from("medicines").select("*").order("name");
        setMedicines((data || []) as Medicine[]);
        setLoading(false);
    };

    const fetchDispenseHistory = async () => {
        const { data } = await supabase.from("dispense_records").select("*").order("dispensed_at", { ascending: false }).limit(50);
        setDispenseHistory((data || []) as DispenseRecord[]);
    };

    const fetchPatients = async () => {
        const { data } = await supabase.from("patients").select("id, name").order("name");
        setPatients(data || []);
    };

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from("medicines").insert({
            name: medForm.name.trim(),
            category: medForm.category,
            quantity: Number(medForm.quantity),
            unit: medForm.unit,
            price_per_unit: Number(medForm.price_per_unit),
            expiry_date: medForm.expiry_date || null,
            manufacturer: medForm.manufacturer.trim() || null,
        });
        setSaving(false);
        if (!error) {
            setMedForm({ name: "", category: "Tablet", quantity: "", unit: "Strips", price_per_unit: "", expiry_date: "", manufacturer: "" });
            setShowAddForm(false);
            fetchMedicines();
        } else {
            alert(error.message);
        }
    };

    const handleDispense = async (e: React.FormEvent) => {
        e.preventDefault();
        const med = medicines.find(m => m.id === dispForm.medicine_id);
        const patient = patients.find(p => p.id === dispForm.patient_id);
        const qty = Number(dispForm.quantity_dispensed);

        if (!med || !patient || !qty || !dispForm.prescribed_by) return;
        if (qty > med.quantity) {
            alert("Insufficient stock! Only " + med.quantity + " " + med.unit + " available.");
            return;
        }

        setSaving(true);

        // Insert dispense record
        const { error } = await supabase.from("dispense_records").insert({
            medicine_id: dispForm.medicine_id,
            medicine_name: med.name,
            patient_name: patient.name,
            quantity_dispensed: qty,
            prescribed_by: dispForm.prescribed_by,
        });

        if (!error) {
            // Deduct stock
            await supabase.from("medicines").update({ quantity: med.quantity - qty }).eq("id", med.id);
            setDispForm({ medicine_id: "", patient_id: "", quantity_dispensed: "", prescribed_by: "" });
            setShowDispenseForm(false);
            fetchMedicines();
            fetchDispenseHistory();
        } else {
            alert(error.message);
        }
        setSaving(false);
    };

    const filteredMeds = useMemo(() => {
        const q = search.toLowerCase();
        return medicines.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }, [medicines, search]);

    const lowStockMeds = medicines.filter(m => m.quantity <= LOW_STOCK_THRESHOLD);
    const totalValue = medicines.reduce((sum, m) => sum + m.quantity * m.price_per_unit, 0);

    const isExpiringSoon = (date: string | null) => {
        if (!date) return false;
        const exp = new Date(date);
        const today = new Date();
        const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30 && diff > 0;
    };

    const isExpired = (date: string | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    return (
        <div>
            {/* Header */}
            <div style={pageHeader}>
                <div>
                    <h2 style={heading}>Pharmacy</h2>
                    <p style={sub}>Medicine inventory, stock and dispensing</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button style={secondaryBtn} onClick={() => { setShowDispenseForm(!showDispenseForm); setShowAddForm(false); }}>
                        {showDispenseForm ? "✕" : "💊 Dispense"}
                    </button>
                    <button style={primaryBtn} onClick={() => { setShowAddForm(!showAddForm); setShowDispenseForm(false); }}>
                        {showAddForm ? "✕" : "+ Add Medicine"}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
                <StatCard label="Total Medicines" value={medicines.length} color="#0ea5e9" numeric />
                <StatCard label="Low Stock Items" value={lowStockMeds.length} color="#f59e0b" numeric />
                <StatCard label="Dispensed Today" value={dispenseHistory.filter(d => d.dispensed_at?.startsWith(new Date().toISOString().split("T")[0])).length} color="#8b5cf6" numeric />
                <StatCard label="Inventory Value (₹)" value={totalValue} color="#10b981" numeric currency />
            </div>

            {/* Low stock alert */}
            {lowStockMeds.length > 0 && (
                <div style={alertBox}>
                    ⚠️ <strong>{lowStockMeds.length} item{lowStockMeds.length > 1 ? "s" : ""}</strong> running low:{" "}
                    {lowStockMeds.slice(0, 4).map(m => m.name).join(", ")}
                    {lowStockMeds.length > 4 ? ` and ${lowStockMeds.length - 4} more...` : ""}
                </div>
            )}

            {/* Add Medicine Form */}
            {showAddForm && (
                <div style={formCard}>
                    <h3 style={formTitle}>+ Add Medicine to Inventory</h3>
                    <form onSubmit={handleAddMedicine} style={formGrid}>
                        <div style={field}><label style={lbl}>Medicine Name</label><input style={inp} placeholder="e.g., Paracetamol 500mg" value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} required /></div>
                        <div style={field}><label style={lbl}>Category</label><select style={inp} value={medForm.category} onChange={e => setMedForm({ ...medForm, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div style={field}><label style={lbl}>Quantity</label><input style={inp} type="number" min={1} placeholder="e.g., 100" value={medForm.quantity} onChange={e => setMedForm({ ...medForm, quantity: e.target.value })} required /></div>
                        <div style={field}><label style={lbl}>Unit</label><select style={inp} value={medForm.unit} onChange={e => setMedForm({ ...medForm, unit: e.target.value })}>{UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
                        <div style={field}><label style={lbl}>Price per Unit (₹)</label><input style={inp} type="number" min={0} placeholder="e.g., 5.00" value={medForm.price_per_unit} onChange={e => setMedForm({ ...medForm, price_per_unit: e.target.value })} required /></div>
                        <div style={field}><label style={lbl}>Expiry Date</label><input style={inp} type="date" value={medForm.expiry_date} onChange={e => setMedForm({ ...medForm, expiry_date: e.target.value })} /></div>
                        <div style={field}><label style={lbl}>Manufacturer</label><input style={inp} placeholder="Manufacturer name" value={medForm.manufacturer} onChange={e => setMedForm({ ...medForm, manufacturer: e.target.value })} /></div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" style={primaryBtn} disabled={saving}>{saving ? "Adding..." : "Add to Inventory"}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Dispense Form */}
            {showDispenseForm && (
                <div style={formCard}>
                    <h3 style={formTitle}>💊 Dispense Medicine</h3>
                    <form onSubmit={handleDispense} style={formGrid}>
                        <div style={field}><label style={lbl}>Patient</label>
                            <select style={inp} value={dispForm.patient_id} onChange={e => setDispForm({ ...dispForm, patient_id: e.target.value })} required>
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={field}><label style={lbl}>Medicine</label>
                            <select style={inp} value={dispForm.medicine_id} onChange={e => setDispForm({ ...dispForm, medicine_id: e.target.value })} required>
                                <option value="">Select Medicine</option>
                                {medicines.filter(m => m.quantity > 0).map(m => (
                                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.quantity} {m.unit})</option>
                                ))}
                            </select>
                        </div>
                        <div style={field}><label style={lbl}>Quantity</label>
                            <input style={inp} type="number" min={1} placeholder="Qty to dispense" value={dispForm.quantity_dispensed} onChange={e => setDispForm({ ...dispForm, quantity_dispensed: e.target.value })} required />
                        </div>
                        <div style={field}><label style={lbl}>Prescribed By</label>
                            <input style={inp} placeholder="Dr. Name" value={dispForm.prescribed_by} onChange={e => setDispForm({ ...dispForm, prescribed_by: e.target.value })} required />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button type="submit" style={primaryBtn} disabled={saving}>{saving ? "Dispensing..." : "Dispense"}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div style={tabBar}>
                {(["inventory", "history"] as const).map(t => (
                    <button key={t} style={tabBtn(tab === t)} onClick={() => setTab(t)}>
                        {t === "inventory" ? "📦 Inventory" : "📋 Dispense History"}
                    </button>
                ))}
            </div>

            {/* Inventory Table */}
            {tab === "inventory" && (
                <>
                    <input style={searchInp} placeholder="🔍  Search medicine or category..." value={search} onChange={e => setSearch(e.target.value)} />
                    {loading ? (
                        <div style={emptyBox}>Loading inventory...</div>
                    ) : filteredMeds.length === 0 ? (
                        <div style={emptyBox}><p style={{ fontSize: 32 }}>💊</p><p style={{ color: "#64748b" }}>No medicines found. Add some inventory.</p></div>
                    ) : (
                        <div style={{ overflowX: "auto", background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                            <table style={tbl}>
                                <thead><tr style={thead}>
                                    <th style={th}>Medicine</th><th style={th}>Category</th>
                                    <th style={th}>Stock</th><th style={th}>Price/Unit</th>
                                    <th style={th}>Expiry</th><th style={th}>Manufacturer</th>
                                </tr></thead>
                                <tbody>
                                    {filteredMeds.map(m => (
                                        <tr key={m.id}>
                                            <td style={{ ...td, fontWeight: 500 }}>{m.name}</td>
                                            <td style={td}><span style={catBadge}>{m.category}</span></td>
                                            <td style={td}>
                                                <span style={{ color: m.quantity <= LOW_STOCK_THRESHOLD ? "#dc2626" : "#166534", fontWeight: 600 }}>
                                                    {m.quantity} {m.unit}
                                                </span>
                                                {m.quantity <= LOW_STOCK_THRESHOLD && <span style={lowTag}> LOW</span>}
                                            </td>
                                            <td style={td}>₹{m.price_per_unit}</td>
                                            <td style={td}>
                                                {m.expiry_date ? (
                                                    <span style={{ color: isExpired(m.expiry_date) ? "#dc2626" : isExpiringSoon(m.expiry_date) ? "#f59e0b" : "#334155" }}>
                                                        {m.expiry_date}
                                                        {isExpired(m.expiry_date) && " ⚠ EXPIRED"}
                                                        {isExpiringSoon(m.expiry_date) && " ⚠ SOON"}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td style={{ ...td, color: "#64748b" }}>{m.manufacturer || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Dispense History */}
            {tab === "history" && (
                dispenseHistory.length === 0 ? (
                    <div style={emptyBox}><p style={{ fontSize: 32 }}>📋</p><p style={{ color: "#64748b" }}>No dispense records yet.</p></div>
                ) : (
                    <div style={{ overflowX: "auto", background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                        <table style={tbl}>
                            <thead><tr style={thead}>
                                <th style={th}>Medicine</th><th style={th}>Patient</th>
                                <th style={th}>Qty</th><th style={th}>Prescribed By</th><th style={th}>Date</th>
                            </tr></thead>
                            <tbody>
                                {dispenseHistory.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ ...td, fontWeight: 500 }}>{d.medicine_name}</td>
                                        <td style={td}>{d.patient_name}</td>
                                        <td style={{ ...td, color: "#0369a1", fontWeight: 600 }}>{d.quantity_dispensed}</td>
                                        <td style={{ ...td, color: "#64748b" }}>{d.prescribed_by}</td>
                                        <td style={{ ...td, color: "#64748b", fontSize: 13 }}>
                                            {new Date(d.dispensed_at).toLocaleDateString("en-IN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}

function StatCard({ label, value, color, numeric, currency }: { label: string; value: number; color: string; numeric?: boolean; currency?: boolean }) {
    return (
        <div style={{ background: "white", padding: "16px 20px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>
                {currency ? `₹${value.toLocaleString("en-IN")}` : numeric ? value : value}
            </div>
        </div>
    );
}

const pageHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 };
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 14, color: "#64748b" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 20 };
const alertBox: React.CSSProperties = { background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#92400e" };
const formCard: React.CSSProperties = { background: "white", padding: 24, borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 20 };
const formTitle: React.CSSProperties = { margin: "0 0 16px", color: "#0c4a6e", fontSize: 16, fontWeight: 600 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inp: React.CSSProperties = { padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit" };
const tabBar: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 20 };
const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "9px 20px", borderRadius: 10, border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "#0ea5e9" : "white", color: active ? "white" : "#64748b",
    cursor: "pointer", fontWeight: active ? 600 : 400, fontSize: 14
});
const searchInp: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", maxWidth: 380, marginBottom: 16 };
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 600 };
const thead: React.CSSProperties = { background: "#f0f9ff" };
const th: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#0369a1", borderBottom: "1px solid #e0f2fe", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 14 };
const catBadge: React.CSSProperties = { padding: "3px 10px", borderRadius: 20, background: "#e0f2fe", color: "#0369a1", fontSize: 12, fontWeight: 500 };
const lowTag: React.CSSProperties = { background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4 };
const primaryBtn: React.CSSProperties = { padding: "10px 20px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 };
const secondaryBtn: React.CSSProperties = { padding: "10px 20px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 };
const emptyBox: React.CSSProperties = { textAlign: "center", padding: 60, background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" };
