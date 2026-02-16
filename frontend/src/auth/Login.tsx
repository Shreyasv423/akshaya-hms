import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import logo from "../assets/photo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

 navigate("/");

  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <img src={logo} alt="Hospital Logo" style={logoStyle} />

        <h2 style={titleStyle}>Akshaya Hospitals</h2>
        <p style={subtitleStyle}>Hospital Management System</p>

        <form onSubmit={login} style={formStyle}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {errorMsg && (
            <div style={errorStyle}>{errorMsg}</div>
          )}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ========================= */
/* 🎨 Styles */
/* ========================= */

const pageStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #e0f2fe, #f0f9ff)"
};

const cardStyle = {
  width: 360,
  padding: 40,
  background: "white",
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center" as const
};

const logoStyle = {
  height: 70,
  marginBottom: 20
};

const titleStyle = {
  margin: 0,
  fontSize: 22,
  color: "#0c4a6e"
};

const subtitleStyle = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 30
};

const formStyle = {
  display: "grid",
  gap: 16
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 14
};

const buttonStyle = {
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#0ea5e9",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const errorStyle = {
  color: "#dc2626",
  fontSize: 13,
  textAlign: "left" as const
};
