import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function BillingSettings() {
  const [fee, setFee] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFee();
  }, []);

  const fetchFee = async () => {
    const { data } = await supabase
      .from("hospital_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) setFee(data.consultation_fee);
  };

  const updateFee = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");

    const { error: err } = await supabase
      .from("hospital_settings")
      .update({
        consultation_fee: fee,
        updated_at: new Date().toISOString()
      })
      .neq("id", "");

    setSaving(false);

    if (err) {
      setError("Failed to update. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div>
      <h2 style={heading}>Billing Settings</h2>
      <p style={subText}>Configure hospital-wide billing parameters.</p>

      <div style={card}>
        <h3 style={cardTitle}>OPD Consultation Fee</h3>
        <p style={desc}>
          This fee is automatically applied to every OPD billing bill at the time of generation.
        </p>

        <div style={row}>
          <div style={inputWrapper}>
            <span style={currencySymbol}>₹</span>
            <input
              type="number"
              min={0}
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              style={inputStyle}
              placeholder="Enter consultation fee"
            />
          </div>

          <button onClick={updateFee} disabled={saving} style={saveBtn}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {success && (
          <div style={successMsg}>
            ✓ Consultation fee updated to ₹{fee} successfully.
          </div>
        )}

        {error && (
          <div style={errorMsg}>{error}</div>
        )}
      </div>

      <div style={infoCard}>
        <h4 style={{ ...cardTitle, marginBottom: 8 }}>How Billing Works</h4>
        <ul style={list}>
          <li>Consultation fee is auto-loaded when generating an OPD bill.</li>
          <li>You can add or remove additional services per bill.</li>
          <li>Discounts can be applied per bill at the time of generation.</li>
          <li>Bills support Cash, UPI, and Card payment modes.</li>
        </ul>
      </div>
    </div>
  );
}

const heading: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0c4a6e",
  marginBottom: 4
};

const subText: React.CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginBottom: 28
};

const card: React.CSSProperties = {
  background: "white",
  padding: 28,
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(14,165,233,0.07)",
  border: "1px solid #e0f2fe",
  marginBottom: 24
};

const infoCard: React.CSSProperties = {
  background: "#f0fdf4",
  padding: 24,
  borderRadius: 14,
  border: "1px solid #bbf7d0"
};

const cardTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#0c4a6e",
  marginBottom: 8
};

const desc: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 20
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap"
};

const inputWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  overflow: "hidden",
  flex: "0 0 220px"
};

const currencySymbol: React.CSSProperties = {
  padding: "10px 14px",
  background: "#f1f5f9",
  color: "#475569",
  fontWeight: 600,
  fontSize: 15,
  borderRight: "1px solid #cbd5e1"
};

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "none",
  fontSize: 15,
  outline: "none",
  width: "100%"
};

const saveBtn: React.CSSProperties = {
  padding: "10px 24px",
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14
};

const successMsg: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 16px",
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500
};

const errorMsg: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 16px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 8,
  fontSize: 14
};

const list: React.CSSProperties = {
  paddingLeft: 20,
  color: "#166534",
  fontSize: 14,
  lineHeight: 1.8
};