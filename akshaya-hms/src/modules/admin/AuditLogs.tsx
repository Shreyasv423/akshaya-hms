import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type AuditLog = {
  id: string;
  created_at: string;
  type: "internal" | "external";
  action: string;
  details?: string | null;
};

export default function AuditLogs() {
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [newDetails, setNewDetails] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("type", activeTab)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLogs(data);
      } else {
        // Fallback if table doesn't exist yet, we show empty state or mock data
        setLogs([]);
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction) return;

    try {
      const { error } = await supabase.from("audit_logs").insert([
        {
          type: activeTab,
          action: newAction,
          details: newDetails,
        }
      ]);

      if (!error) {
        setNewAction("");
        setNewDetails("");
        setShowAddModal(false);
        fetchLogs();
      } else {
        alert("Error adding log. Make sure 'audit_logs' table exists in Supabase. Schema: id, created_at, type, action, details.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={headerSectionStyle}>
        <div>
          <h2 style={headingStyle}>Audit Logs</h2>
          <p style={subtextStyle}>
            View internal logs for administration and external logs for the tax department.
          </p>
        </div>
        <button style={btnPrimary} onClick={() => setShowAddModal(true)}>
          + Add {activeTab === "internal" ? "Internal" : "External"} Log
        </button>
      </div>

      <div style={tabsStyle}>
        <div
          style={activeTab === "internal" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("internal")}
        >
          Internal Audit (Hospital Admin)
        </div>
        <div
          style={activeTab === "external" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("external")}
        >
          External Audit (Tax Department)
        </div>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <p style={emptyText}>Loading logs...</p>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={emptyText}>No {activeTab} audit logs found.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              Ensure the `audit_logs` table exists in Supabase with columns: `id`, `created_at`, `type`, `action`, `details`.
            </p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={thRowStyle}>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={trStyle}>
                  <td style={tdStyle}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: "#0f172a" }}>{log.action}</td>
                  <td style={tdStyle}>{log.details || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ marginBottom: 15 }}>Add {activeTab} Log</h3>
            <form onSubmit={handleAddLog}>
              <div style={{ marginBottom: 15 }}>
                <label style={labelStyle}>Action / Title</label>
                <input
                  style={inputStyle}
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Q1 Tax Report Generated"
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Details / Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80 }}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Additional information..."
                />
              </div>
              <div style={modalActionsStyle}>
                <button
                  type="button"
                  style={btnSecondary}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={btnPrimary}>
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Styles ================= */

const headerSectionStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
};

const headingStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 4,
};

const subtextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  margin: 0,
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
  borderBottom: "1px solid #e2e8f0",
};

const activeTabStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontWeight: 600,
  color: "#0ea5e9",
  borderBottom: "2px solid #0ea5e9",
  cursor: "pointer",
};

const inactiveTabStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontWeight: 500,
  color: "#64748b",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 14,
  boxShadow: "0 6px 16px rgba(14,165,233,0.08)",
  minHeight: 300,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thRowStyle: React.CSSProperties = {
  borderBottom: "2px solid #e2e8f0",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  color: "#64748b",
  fontWeight: 600,
};

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  color: "#475569",
};

const emptyText: React.CSSProperties = {
  color: "#64748b",
};

const btnPrimary: React.CSSProperties = {
  background: "#0ea5e9",
  color: "white",
  border: "none",
  padding: "9px 18px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "#e2e8f0",
  color: "#334155",
  border: "none",
  padding: "9px 18px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  width: "100%",
  maxWidth: 400,
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: 14,
};

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
};
