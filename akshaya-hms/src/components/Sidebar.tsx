import { NavLink } from "react-router-dom";
import {
  Stethoscope,
  BedDouble,
  FileText,
  LayoutDashboard,
  Settings,
  FlaskConical,
  Pill,
  Activity,
  HeartPulse,
  Monitor
} from "lucide-react";

type Props = {
  role: string;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
};

export default function Sidebar({ role, isOpen, isMobile, onClose }: Props) {
  const linkStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 16px",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 4,
    textDecoration: "none",
    background: isActive ? "#ecfdf5" : "transparent",
    color: isActive ? "#047857" : "#334155",
    borderLeft: isActive ? "3px solid #10b981" : "3px solid transparent",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s"
  });

  const NavItem = ({
    to,
    icon,
    label
  }: {
    to: string;
    icon: React.ReactNode;
    label: string;
  }) => (
    <NavLink
      to={to}
      style={({ isActive }) => linkStyle(isActive)}
      onClick={onClose}
    >
      {icon}
      {label}
    </NavLink>
  );

  return (
    <>
      {/* Overlay — only on mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div onClick={onClose} style={overlayStyle} />
      )}

      <aside
        style={{
          ...containerStyle,
          // On desktop: always visible, static in flow. On mobile: fixed overlay
          position: isMobile ? "fixed" : "fixed",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)"
        }}
      >
        {/* Role Badge */}
        <div style={roleBadgeStyle}>
          <span style={{ fontSize: 16 }}>🏥</span>
          <span>{role?.toUpperCase()}</span>
        </div>

        <nav>
          {/* Admin Section */}
          {role === "admin" && (
            <>
              <div style={sectionLabel}>Overview</div>
              <NavItem to="/admin" icon={<LayoutDashboard size={17} />} label="Dashboard" />
            </>
          )}

          {/* Patients & OPD — admin + reception */}
          {(role === "admin" || role === "reception") && (
            <>
              <div style={sectionLabel}>Front Desk</div>
              <NavItem to="/front-desk" icon={<Monitor size={17} />} label="Front Desk" />
            </>
          )}

          {role === "doctor" && (
            <>
              <div style={sectionLabel}>Clinic</div>
              <NavItem to="/opd" icon={<Stethoscope size={17} />} label="OPD" />
            </>
          )}

          {/* Admin-only hospital modules */}
          {role === "admin" && (
            <>
              <div style={sectionLabel}>Hospital</div>
              <NavItem to="/ipd" icon={<BedDouble size={17} />} label="IPD" />
              <NavItem to="/icu" icon={<HeartPulse size={17} />} label="ICU" />
              <NavItem to="/discharge" icon={<FileText size={17} />} label="Discharge" />

              <div style={sectionLabel}>Services</div>
              <NavItem to="/lab" icon={<FlaskConical size={17} />} label="Laboratory" />
              <NavItem to="/pharmacy" icon={<Pill size={17} />} label="Pharmacy" />

              <div style={sectionLabel}>Management</div>
              <NavItem to="/hr" icon={<Activity size={17} />} label="HR" />
              <NavItem to="/billing-settings" icon={<Settings size={17} />} label="Settings" />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

const containerStyle: React.CSSProperties = {
  top: 80,
  left: 0,
  width: 260,
  height: "calc(100vh - 80px)",
  background: "#ffffff",
  padding: "20px 16px",
  borderRight: "1px solid #e2e8f0",
  transition: "transform 0.3s ease",
  zIndex: 1000,
  overflowY: "auto"
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  zIndex: 999
};

const roleBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 24,
  padding: "8px 14px",
  borderRadius: 20,
  background: "linear-gradient(135deg, #e0f2fe, #f0fdf4)",
  color: "#0c4a6e",
  letterSpacing: "0.04em"
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#94a3b8",
  textTransform: "uppercase",
  padding: "14px 16px 6px",
  userSelect: "none"
};