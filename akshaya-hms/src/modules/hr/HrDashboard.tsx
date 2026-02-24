import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../services/supabase";

type Staff = {
    id: string;
    name: string;
    role: string;
    department: string;
    phone: string | null;
    email: string | null;
    join_date: string | null;
    is_active: boolean;
    created_at: string;
};

const DEPARTMENTS = [
    "Administration", "OPD", "IPD", "ICU", "Emergency",
    "Laboratory", "Pharmacy", "Radiology", "Operation Theatre",
    "Nursing", "Housekeeping", "Security", "Accounts", "IT"
];

const ROLES = [
    "Doctor", "Nurse", "Receptionist", "Lab Technician",
    "Pharmacist", "Ward Boy", "Accountant", "Administrator",
    "Security Guard", "Housekeeping Staff", "IT Support", "Other"
];

export default function HrDashboard() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("All");
    const [filterActive, setFilterActive] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [editStaff, setEditStaff] = useState<Staff | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "", role: "Nurse", department: "Nursing",
        phone: "", email: "", join_date: "", is_active: true
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        const { data } = await supabase.from("staff").select("*").order("name");
        setStaff((data || []) as Staff[]);
        setLoading(false);
    };

    const openAddForm = () => {
        setEditStaff(null);
        setForm({ name: "", role: "Nurse", department: "Nursing", phone: "", email: "", join_date: "", is_active: true });
        setShowForm(true);
    };

    const openEditForm = (s: Staff) => {
        setEditStaff(s);
        setForm({ name: s.name, role: s.role, department: s.department, phone: s.phone || "", email: s.email || "", join_date: s.join_date || "", is_active: s.is_active });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            role: form.role,
            department: form.department,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            join_date: form.join_date || null,
            is_active: form.is_active,
        };

        let error;
        if (editStaff) {
            ({ error } = await supabase.from("staff").update(payload).eq("id", editStaff.id));
        } else {
            ({ error } = await supabase.from("staff").insert(payload));
        }

        setSaving(false);
        if (!error) {
            setShowForm(false);
            setEditStaff(null);
            fetchStaff();
        } else {
            alert(error.message);
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from("staff").update({ is_active: !current }).eq("id", id);
        fetchStaff();
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return staff.filter(s => {
            const matchSearch = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.department.toLowerCase().includes(q) || s.phone?.includes(q);
            const matchDept = filterDept === "All" || s.department === filterDept;
            const matchActive = filterActive === "All" || (filterActive === "Active" ? s.is_active : !s.is_active);
            return matchSearch && matchDept && matchActive;
        });
    }, [staff, search, filterDept, filterActive]);

    const activeCount = staff.filter(s => s.is_active).length;
    const inactiveCount = staff.filter(s => !s.is_active).length;

    // Group by department for summary
    const deptCounts = useMemo(() => {
        const map: Record<string, number> = {};
        staff.filter(s => s.is_active).forEach(s => {
            map[s.department] = (map[s.department] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [staff]);

    return (
        <div>
            {/* Header */}
            <div style={pageHeader}>
                <div>
                    <h2 style={heading}>HR Management</h2>
                    <p style={sub}>Staff directory and workforce management</p>
                </div>
                <button style={primaryBtn} onClick={openAddForm}>+ Add Staff</button>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
                <StatCard label="Total Staff" value={staff.length} color="#0ea5e9" />
                <StatCard label="Active" value={activeCount} color="#10b981" />
                <StatCard label="Inactive" value={inactiveCount} color="#94a3b8" />
                <StatCard label="Departments" value={deptCounts.length} color="#8b5cf6" />
            </div>

            {/* Department Summary */}
            {deptCounts.length > 0 && (
                <div style={deptGrid}>
                    {deptCounts.slice(0, 8).map(([dept, count]) => (
                        <div key={dept} style={deptCard} onClick={() => setFilterDept(dept === filterDept ? "All" : dept)}>
                            <div style={{ fontWeight: 700, fontSize: 22, color: "#0ea5e9" }}>{count}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{dept}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Form */}
            {showForm && (
                <div style={formCard}>
                    <h3 style={formTitle}>{editStaff ? "✏️ Edit Staff Member" : "+ Add New Staff Member"}</h3>
                    <form onSubmit={handleSave} style={formGrid}>
                        <div style={field}><label style={lbl}>Full Name *</label><input style={inp} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div style={field}><label style={lbl}>Role / Designation</label>
                            <select style={inp} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div style={field}><label style={lbl}>Department</label>
                            <select style={inp} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div style={field}><label style={lbl}>Phone</label><input style={inp} placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        <div style={field}><label style={lbl}>Email</label><input style={inp} type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div style={field}><label style={lbl}>Join Date</label><input style={inp} type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
                        <div style={{ ...field, justifyContent: "flex-end", paddingBottom: 4 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ width: 16, height: 16 }} />
                                <span style={{ color: form.is_active ? "#166534" : "#64748b", fontWeight: 500 }}>
                                    {form.is_active ? "Active Employee" : "Inactive / Left"}
                                </span>
                            </label>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                            <button type="submit" style={primaryBtn} disabled={saving}>{saving ? "Saving..." : editStaff ? "Update" : "Add Staff"}</button>
                            <button type="button" style={cancelBtn} onClick={() => { setShowForm(false); setEditStaff(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={filterRow}>
                <input style={searchInp} placeholder="🔍  Search by name, role, department, phone..." value={search} onChange={e => setSearch(e.target.value)} />
                <select style={filterSelect} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="All">All Departments</option>
                    {deptCounts.map(([dept]) => <option key={dept}>{dept}</option>)}
                </select>
                <div style={pillGroup}>
                    {["All", "Active", "Inactive"].map(v => (
                        <button key={v} style={pill(filterActive === v)} onClick={() => setFilterActive(v)}>{v}</button>
                    ))}
                </div>
            </div>

            {/* Staff Table */}
            {loading ? (
                <div style={emptyBox}>Loading staff...</div>
            ) : filtered.length === 0 ? (
                <div style={emptyBox}>
                    <p style={{ fontSize: 32 }}>👥</p>
                    <p style={{ color: "#64748b" }}>No staff found. {staff.length === 0 ? "Add your first staff member." : "Try adjusting filters."}</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto", background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                    <table style={tbl}>
                        <thead>
                            <tr style={thead}>
                                <th style={th}>Name</th>
                                <th style={th}>Role</th>
                                <th style={th}>Department</th>
                                <th style={th}>Phone</th>
                                <th style={th}>Join Date</th>
                                <th style={th}>Status</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={avatar(s.is_active)}>{s.name[0].toUpperCase()}</div>
                                            {s.name}
                                        </div>
                                    </td>
                                    <td style={td}><span style={roleBadge}>{s.role}</span></td>
                                    <td style={{ ...td, color: "#475569" }}>{s.department}</td>
                                    <td style={{ ...td, color: "#64748b" }}>{s.phone || "—"}</td>
                                    <td style={{ ...td, color: "#64748b", fontSize: 13 }}>
                                        {s.join_date ? new Date(s.join_date).toLocaleDateString("en-IN") : "—"}
                                    </td>
                                    <td style={td}>
                                        <span style={statusBadge(s.is_active)}>
                                            {s.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={td}>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button style={actionBtn("#0ea5e9")} onClick={() => openEditForm(s)}>Edit</button>
                                            <button style={actionBtn(s.is_active ? "#64748b" : "#10b981")} onClick={() => toggleActive(s.id, s.is_active)}>
                                                {s.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

const avatar = (active: boolean): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    background: active ? "#e0f2fe" : "#f1f5f9", color: active ? "#0369a1" : "#94a3b8",
    fontWeight: 700, fontSize: 14, flexShrink: 0
});

const pageHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 };
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 14, color: "#64748b" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 20 };
const deptGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 24 };
const deptCard: React.CSSProperties = { background: "white", padding: "14px 16px", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", textAlign: "center", cursor: "pointer", border: "1px solid #e2e8f0" };
const formCard: React.CSSProperties = { background: "white", padding: 24, borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 24 };
const formTitle: React.CSSProperties = { margin: "0 0 16px", color: "#0c4a6e", fontSize: 16, fontWeight: 600 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5 };
const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inp: React.CSSProperties = { padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit" };
const filterRow: React.CSSProperties = { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" };
const searchInp: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, flex: "1 1 260px" };
const filterSelect: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 };
const pillGroup: React.CSSProperties = { display: "flex", gap: 6 };
const pill = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 20, border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "#0ea5e9" : "white", color: active ? "white" : "#64748b",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400
});
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 680 };
const thead: React.CSSProperties = { background: "#f0f9ff" };
const th: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#0369a1", borderBottom: "1px solid #e0f2fe", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 14 };
const roleBadge: React.CSSProperties = { padding: "3px 10px", borderRadius: 20, background: "#f3e8ff", color: "#6d28d9", fontSize: 12, fontWeight: 500 };
const statusBadge = (active: boolean): React.CSSProperties => ({
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: active ? "#dcfce7" : "#f1f5f9", color: active ? "#166534" : "#94a3b8"
});
const actionBtn = (bg: string): React.CSSProperties => ({ padding: "5px 12px", background: bg, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 });
const primaryBtn: React.CSSProperties = { padding: "10px 20px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 };
const cancelBtn: React.CSSProperties = { padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 500, cursor: "pointer" };
const emptyBox: React.CSSProperties = { textAlign: "center", padding: 60, background: "white", borderRadius: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" };
