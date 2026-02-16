import logo from "../assets/photo.png";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed");
      return;
    }

    navigate("/login"); // change if your login route is different
  };

  return (
    <div style={navbarStyle}>
      <div style={innerWrapper}>
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

      {/* Right Side Logout */}
      <div>
        <button style={logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* ========================= */
/* 🎨 Brand Styles           */
/* ========================= */

const navbarStyle = {
  height: 120,
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 60px",
  borderBottom: "4px solid #0ea5e9",
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
};

const innerWrapper = {
  display: "flex",
  alignItems: "center",
  gap: 24
};

const logoStyle = {
  height: 90,
  width: "auto"
};

const titleRow = {
  fontSize: 34,
  fontWeight: 700,
  lineHeight: 1.1
};

const akshayaStyle = {
  color: "#1f4f82"
};

const hospitalsStyle = {
  color: "#4e9c4c"
};

const taglineStyle = {
  fontSize: 16,
  marginTop: 6,
  color: "#5e8c7d",
  letterSpacing: 0.5
};

const logoutBtn = {
  background: "#dc2626",
  color: "white",
  padding: "10px 18px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};
