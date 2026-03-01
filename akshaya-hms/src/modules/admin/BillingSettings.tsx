import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { Building2, IndianRupee, Percent, Phone, MapPin, Globe, Save, CheckCircle2 } from "lucide-react";

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    hospital_name: "Akshaya Hospital",
    address: "",
    phone: "",
    website: "",
    consultation_fee: 0,
    gst_percent: 0,
    currency: "INR",
    bed_charges: {
      "General Ward": 800,
      "Semi-Private": 1500,
      "Private": 3000,
      "ICU": 5000
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    fetchSettings();
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("hospital_settings").select("*").single();
    if (data) {
      setSettings({
        ...settings,
        ...data,
        bed_charges: data.bed_charges || settings.bed_charges
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("hospital_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .neq("id", "");

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading settings...</div>;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={isMobile ? mobileHeader : header}>
        <div style={{ marginBottom: isMobile ? 16 : 0 }}>
          <h2 style={title}>Hospital Settings</h2>
          <p style={subtitle}>Global configuration and contact details</p>
        </div>
        <button style={saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : <><Save size={18} /> Save Settings</>}
        </button>
      </div>

      {showSuccess && (
        <div style={successBanner}>
          <CheckCircle2 size={18} /> Settings successfully updated!
        </div>
      )}

      <div style={{ ...grid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
        {/* Hospital Profile */}
        <div style={card}>
          <h3 style={cardTitle}><Building2 size={18} /> Hospital Profile</h3>
          <div style={{ ...formGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
            <div style={{ ...field, gridColumn: "span 1" }}>
              <label style={lbl}>Hospital Name</label>
              <input
                style={inp}
                value={settings.hospital_name}
                onChange={e => setSettings({ ...settings, hospital_name: e.target.value })}
              />
            </div>
            <div style={{ ...field, gridColumn: "span 1" }}>
              <label style={lbl}>Contact Phone</label>
              <div style={iconInp}>
                <Phone size={14} color="#64748b" />
                <input
                  style={plainInp}
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
            </div>
            <div style={{ ...field, gridColumn: "span 1" }}>
              <label style={lbl}>Website URL</label>
              <div style={iconInp}>
                <Globe size={14} color="#64748b" />
                <input
                  style={plainInp}
                  value={settings.website}
                  onChange={e => setSettings({ ...settings, website: e.target.value })}
                />
              </div>
            </div>
            <div style={{ ...field, gridColumn: isMobile ? "span 1" : "span 2" }}>
              <label style={lbl}>Address</label>
              <div style={iconInp}>
                <MapPin size={14} color="#64748b" />
                <input
                  style={plainInp}
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing & Finance */}
        <div style={card}>
          <h3 style={cardTitle}><IndianRupee size={18} /> Billing Defaults</h3>
          <div style={{ ...formGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
            <div style={field}>
              <label style={lbl}>OPD Consultation Fee</label>
              <div style={iconInp}>
                <IndianRupee size={14} color="#64748b" />
                <input
                  type="number"
                  style={plainInp}
                  value={settings.consultation_fee}
                  onChange={e => setSettings({ ...settings, consultation_fee: Number(e.target.value) })}
                />
              </div>
            </div>
            <div style={field}>
              <label style={lbl}>Tax / GST (%)</label>
              <div style={iconInp}>
                <Percent size={14} color="#64748b" />
                <input
                  type="number"
                  style={plainInp}
                  value={settings.gst_percent}
                  onChange={e => setSettings({ ...settings, gst_percent: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <h4 style={{ ...sectionLabel, marginTop: 20 }}>Bed Charges (per day)</h4>
          <div style={bedChargesGrid}>
            {Object.entries(settings.bed_charges).map(([ward, charge]) => (
              <div key={ward} style={bedChargeRow}>
                <span style={wardName}>{ward}</span>
                <div style={smallIconInp}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>₹</span>
                  <input
                    type="number"
                    style={smallInp}
                    value={charge}
                    onChange={e => {
                      const updated = { ...settings.bed_charges, [ward]: Number(e.target.value) };
                      setSettings({ ...settings, bed_charges: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 };
const mobileHeader: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 24 };
const title: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", margin: 0 };
const subtitle: React.CSSProperties = { fontSize: 14, color: "#64748b", margin: "4px 0 0 0" };

const successBanner: React.CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: "12px 16px",
  borderRadius: 10,
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 14,
  fontWeight: 500
};

const grid: React.CSSProperties = { display: "grid", gap: 24 };
const card: React.CSSProperties = { background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" };
const cardTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#0c4a6e", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 };

const formGrid: React.CSSProperties = { display: "grid", gap: 16 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748b" };
const inp: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" };

const iconInp: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "0 12px", borderRadius: 8, border: "1px solid #cbd5e1" };
const plainInp: React.CSSProperties = { border: "none", padding: "10px 0", outline: "none", fontSize: 14, width: "100%" };

const sectionLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 };
const bedChargesGrid: React.CSSProperties = { display: "grid", gap: 10 };
const bedChargeRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", borderRadius: 8 };
const wardName: React.CSSProperties = { fontSize: 13, color: "#475569" };
const smallIconInp: React.CSSProperties = { display: "flex", alignItems: "center", gap: 4, background: "white", padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0" };
const smallInp: React.CSSProperties = { border: "none", outline: "none", width: 60, fontSize: 13, textAlign: "right", fontWeight: 600 };

const saveBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 20px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
  width: "fit-content"
};