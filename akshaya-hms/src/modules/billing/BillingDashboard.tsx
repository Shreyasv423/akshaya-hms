import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { Receipt, Search, Download, Filter, CreditCard, Banknote, Smartphone } from "lucide-react";

type Bill = {
    id: string;
    patient_id: string;
    patient_name: string;
    total_amount: number;
    payment_mode: string;
    created_at: string;
    type: "OPD" | "IPD";
};

export default function BillingDashboard() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const fetchBills = async () => {
        setLoading(true);
        // Fetch all bills from opd_bills table
        // Join with patients to get the name for both OPD and IPD bills
        const { data: billsData, error } = await supabase
            .from("opd_bills")
            .select(`
                id,
                patient_id,
                total_amount,
                payment_mode,
                created_at,
                patients (name)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching bills:", error);
            setLoading(false);
            return;
        }

        // Transform bills
        const formattedBills: Bill[] = (billsData || []).map(b => ({
            id: b.id,
            patient_id: b.patient_id,
            patient_name: (b as any).patients?.name || "Unknown Patient",
            total_amount: b.total_amount,
            payment_mode: b.payment_mode,
            created_at: b.created_at,
            // For now, if there's no consultation fee or if it's 0 it might be IPD, 
            // but let's just keep it simple or check if we can distinguish
            type: (b as any).consultation_fee > 0 ? "OPD" : "IPD"
        }));

        setBills(formattedBills);
        setLoading(false);
    };

    useEffect(() => {
        fetchBills();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:opd_bills')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'opd_bills' }, () => {
                fetchBills();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredBills = bills.filter(b => {
        const matchesSearch = b.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.includes(searchTerm);
        const matchesType = filterType === "All" || b.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalRevenue = bills.reduce((sum, b) => sum + b.total_amount, 0);
    const todayRevenue = bills
        .filter(b => new Date(b.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, b) => sum + b.total_amount, 0);

    const getPaymentIcon = (mode: string) => {
        switch (mode.toLowerCase()) {
            case "cash": return <Banknote size={14} />;
            case "card": return <CreditCard size={14} />;
            case "upi": return <Smartphone size={14} />;
            default: return <Receipt size={14} />;
        }
    };

    return (
        <div>
            <div style={header}>
                <div>
                    <h2 style={title}>Billing System</h2>
                    <p style={subtitle}>Manage hospital revenue and patient invoices</p>
                </div>
            </div>

            {/* Stats */}
            <div style={statsGrid}>
                <div style={{ ...statCard, borderTop: "3px solid #0ea5e9" }}>
                    <div style={statLabel}>Total Revenue</div>
                    <div style={statValue}>₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div style={{ ...statCard, borderTop: "3px solid #10b981" }}>
                    <div style={statLabel}>Collection Today</div>
                    <div style={statValue}>₹{todayRevenue.toLocaleString()}</div>
                </div>
                <div style={{ ...statCard, borderTop: "3px solid #6366f1" }}>
                    <div style={statLabel}>Total Bills</div>
                    <div style={statValue}>{bills.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div style={filterRow}>
                <div style={searchBox}>
                    <Search size={18} color="#64748b" />
                    <input
                        style={searchInput}
                        placeholder="Search patient or Bill ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={filterGroup}>
                    <Filter size={16} color="#64748b" />
                    <select
                        style={selectInput}
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="OPD">OPD Bills</option>
                        <option value="IPD">IPD Bills</option>
                    </select>
                </div>
            </div>

            {/* Billing Table */}
            <div style={tableWrapper}>
                {loading ? (
                    <div style={emptyState}>Loading billing records...</div>
                ) : filteredBills.length === 0 ? (
                    <div style={emptyState}>No billing records found.</div>
                ) : (
                    <table style={table}>
                        <thead>
                            <tr style={thead}>
                                <th style={th}>Bill Date</th>
                                <th style={th}>Bill ID</th>
                                <th style={th}>Patient Name</th>
                                <th style={th}>Type</th>
                                <th style={th}>Amount</th>
                                <th style={th}>Mode</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBills.map(bill => (
                                <tr key={bill.id} style={tr}>
                                    <td style={td}>
                                        {new Date(bill.created_at).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </td>
                                    <td style={{ ...td, fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                                        #{bill.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td style={{ ...td, fontWeight: 600 }}>{bill.patient_name}</td>
                                    <td style={td}>
                                        <span style={typeBadge(bill.type)}>{bill.type}</span>
                                    </td>
                                    <td style={{ ...td, fontWeight: 700, color: "#1e293b" }}>
                                        ₹{bill.total_amount.toLocaleString()}
                                    </td>
                                    <td style={td}>
                                        <div style={paymentBadge}>
                                            {getPaymentIcon(bill.payment_mode)}
                                            {bill.payment_mode}
                                        </div>
                                    </td>
                                    <td style={td}>
                                        <button style={actionBtn}>
                                            <Download size={14} /> Print
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const header: React.CSSProperties = { marginBottom: 24 };
const title: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", margin: 0 };
const subtitle: React.CSSProperties = { fontSize: 14, color: "#64748b", margin: "4px 0 0 0" };

const statsGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 28
};

const statCard: React.CSSProperties = {
    background: "white",
    padding: "20px",
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const statLabel: React.CSSProperties = { fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 8 };
const statValue: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: "#1e293b" };

const filterRow: React.CSSProperties = { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" };
const searchBox: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "white",
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    flex: 1,
    minWidth: 260
};
const searchInput: React.CSSProperties = { border: "none", padding: "12px 0", outline: "none", width: "100%", fontSize: 14 };

const filterGroup: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "white",
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0"
};
const selectInput: React.CSSProperties = { border: "none", padding: "12px 0", outline: "none", background: "transparent", fontSize: 14, color: "#475569" };

const tableWrapper: React.CSSProperties = {
    background: "white",
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    overflowX: "auto"
};

const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 800 };
const thead: React.CSSProperties = { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" };
const th: React.CSSProperties = { padding: "14px 18px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#475569" };
const tr: React.CSSProperties = { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" };
const td: React.CSSProperties = { padding: "14px 18px", fontSize: 14, color: "#334155" };

const typeBadge = (type: string): React.CSSProperties => ({
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: type === "OPD" ? "#e0f2fe" : "#fef3c7",
    color: type === "OPD" ? "#0369a1" : "#b45309"
});

const paymentBadge: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#64748b"
};

const actionBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer"
};

const emptyState: React.CSSProperties = { textAlign: "center", padding: 60, color: "#94a3b8" };
