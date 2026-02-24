import { NavLink } from "react-router-dom";
import {
  Users,
  Stethoscope,
  BedDouble,
  FileText,
  LayoutDashboard,
  Settings
} from "lucide-react";

type Props = {
  role: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ role, isOpen, onClose }: Props) {
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
    background: isActive ? "#ecfdf5" : "transparent",
    color: isActive ? "#047857" : "#334155",
    borderLeft: isActive ? "4px solid #10b981" : "4px solid transparent",
    cursor: "pointer"
  });

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={overlay} />
      )}

      <div
        style={{
          ...containerStyle,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)"
        }}
      >
        <div style={roleBadge}>
          🔐 {role?.toUpperCase()}
        </div>

        {role === "admin" && (
          <NavLink to="/admin" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
            <LayoutDashboard size={18} />
            Admin Dashboard
          </NavLink>
        )}

        {(role === "admin" || role === "reception") && (
          <>
            <NavLink to="/patients" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
              <Users size={18} />
              Patients
            </NavLink>

            <NavLink to="/opd" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
              <Stethoscope size={18} />
              OPD
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink to="/ipd" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
              <BedDouble size={18} />
              IPD
            </NavLink>

            <NavLink to="/discharge" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
              <FileText size={18} />
              Discharge
            </NavLink>

            <NavLink to="/billing-settings" style={({ isActive }) => linkStyle(isActive)} onClick={onClose}>
              <Settings size={18} />
              Billing Settings
            </NavLink>
          </>
        )}
      </div>
    </>
  );
}

const containerStyle = {
  position: "fixed" as const,
  top: 80,
  left: 0,
  width: 260,
  height: "calc(100vh - 80px)",
  background: "#ffffff",
  padding: 24,
  borderRight: "1px solid #e2e8f0",
  transition: "transform 0.3s ease",
  zIndex: 1000,
  overflowY: "auto" as const
};

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  zIndex: 999
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