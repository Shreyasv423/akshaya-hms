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
    navigate("/login");
  };

  return (
    <div style={navbarStyle}>
      <div style={leftSection}>
        <button style={menuBtn} onClick={toggleSidebar}>
          ☰
        </button>

        <img src={logo} alt="AH Logo" style={logoStyle} />

        <div>
          <div style={titleRow}>
            <span style={akshayaStyle}>Akshaya </span>
            <span style={hospitalsStyle}>Hospitals</span>
          </div>
          <div style={taglineStyle}>
            Together for Better Health
          </div>
        </div>
      </div>

      <button style={logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

const navbarStyle = {
  height: 80,
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
  borderBottom: "3px solid #0ea5e9",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  position: "sticky" as const,
  top: 0,
  zIndex: 1000
};

const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const menuBtn = {
  fontSize: 22,
  background: "transparent",
  border: "none",
  cursor: "pointer"
};

const logoStyle = {
  height: 50
};

const titleRow = {
  fontSize: 20,
  fontWeight: 700
};

const akshayaStyle = { color: "#1f4f82" };
const hospitalsStyle = { color: "#4e9c4c" };

const taglineStyle = {
  fontSize: 12,
  color: "#64748b"
};

const logoutBtn = {
  background: "#dc2626",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};