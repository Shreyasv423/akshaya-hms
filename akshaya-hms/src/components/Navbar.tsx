import logo from "../assets/photo.png";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

type Props = {
  toggleSidebar: () => void;
};

export default function Navbar({ toggleSidebar }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div style={navbarStyle}>
      <div style={leftSection}>
        <button
          style={menuBtn}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          ☰
        </button>

        <img src={logo} alt="Akshaya Hospitals Logo" style={logoStyle} />

        <div>
          <div style={titleRow}>
            <span style={akshayaStyle}>Akshaya </span>
            <span style={hospitalsStyle}>Hospitals</span>
          </div>
          <div className="tagline" style={taglineStyle}>Together for Better Health</div>
        </div>
      </div>

      <div style={rightSection}>
        <button style={logoutBtn} onClick={handleLogout}>
          <span className="logout-btn-text">Logout</span>
          <span style={{ display: "none" }} className="mobile-only">✕</span>
        </button>
      </div>
    </div>
  );
}

const navbarStyle: React.CSSProperties = {
  height: 80,
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
  borderBottom: "3px solid #0ea5e9",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  position: "sticky",
  top: 0,
  zIndex: 1100,
  flexShrink: 0
};

const leftSection: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0
};

const menuBtn: React.CSSProperties = {
  fontSize: 22,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "4px 8px",
  color: "#1e293b",
  flexShrink: 0
};

const logoStyle: React.CSSProperties = {
  height: 48,
  flexShrink: 0
};

const titleRow: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.2
};

const akshayaStyle: React.CSSProperties = { color: "#1f4f82" };
const hospitalsStyle: React.CSSProperties = { color: "#4e9c4c" };

const taglineStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#94a3b8",
  marginTop: 2
};

const rightSection: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexShrink: 0
};

const logoutBtn: React.CSSProperties = {
  background: "#dc2626",
  color: "white",
  padding: "8px 16px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};