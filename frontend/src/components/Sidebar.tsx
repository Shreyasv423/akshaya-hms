import { NavLink } from "react-router-dom";
import {
  Users,
  Stethoscope,
  BedDouble,
  FileText
} from "lucide-react";

type Props = {
  role: string;
};

export default function Sidebar({ role }: Props) {
  const linkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 10,
    textDecoration: "none",
    transition: "all 0.2s ease",
    background: isActive ? "#ecfdf5" : "transparent",
    color: isActive ? "#047857" : "#334155",
    borderLeft: isActive ? "4px solid #10b981" : "4px solid transparent",
    cursor: "pointer"
  });

  const containerStyle = {
    width: 260,
    minHeight: "100vh",
    background: "#ffffff",
    padding: 24,
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column" as const
  };

  const roleBadge = {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 30,
    padding: "6px 12px",
    borderRadius: 20,
    background: "#f1f5f9",
    color: "#475569",
    width: "fit-content"
  };

  return (
    <div style={containerStyle}>
      {/* Role */}
      <div style={roleBadge}>
        🔐 {role?.toUpperCase()}
      </div>

      {(role === "admin" || role === "reception") && (
        <>
          <NavLink to="/patients" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div style={linkStyle(isActive)}>
                <Users size={18} />
                Patients
              </div>
            )}
          </NavLink>

          <NavLink to="/opd" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div style={linkStyle(isActive)}>
                <Stethoscope size={18} />
                OPD
              </div>
            )}
          </NavLink>
        </>
      )}

      {role === "doctor" && (
        <NavLink to="/opd" style={{ textDecoration: "none" }}>
          {({ isActive }) => (
            <div style={linkStyle(isActive)}>
              <Stethoscope size={18} />
              OPD
            </div>
          )}
        </NavLink>
      )}

      {role === "admin" && (
        <>
          <NavLink to="/ipd" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div style={linkStyle(isActive)}>
                <BedDouble size={18} />
                IPD
              </div>
            )}
          </NavLink>
          
          <NavLink to="/discharge" style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div style={linkStyle(isActive)}>
                <FileText size={18} />
                Discharge
              </div>
            )}
          </NavLink>
        </>
      )}
    </div>
  );
}