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
  Monitor,
  Receipt,
  ShieldAlert,
  ClipboardList,
  Scissors,
  FilePlus
} from "lucide-react";

type Props = {
  role: string;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
};

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
  label,
  onClick
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <NavLink
    to={to}
    style={({ isActive }) => linkStyle(isActive)}
    onClick={onClick}
  >
    {icon}
    {label}
  </NavLink>
);

export default function Sidebar({ role, isOpen, isMobile, onClose }: Props) {
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
              <NavItem to="/admin" icon={<LayoutDashboard size={17} />} label="Dashboard" onClick={onClose} />
              <NavItem to="/audit-logs" icon={<ShieldAlert size={17} />} label="Audit Logs" onClick={onClose} />
            </>
          )}

          {/* Patients & OPD — admin + reception */}
          {(role === "admin" || role === "reception") && (
            <>
              <div style={sectionLabel}>Front Desk</div>
              <NavItem to="/front-desk" icon={<Monitor size={17} />} label="Front Desk" onClick={onClose} />
              <NavItem to="/billing" icon={<Receipt size={17} />} label="Billing" onClick={onClose} />
              <NavItem to="/insurance" icon={<FilePlus size={17} />} label="TPA Claims" onClick={onClose} />
            </>
          )}

          {role === "doctor" && (
            <>
              <div style={sectionLabel}>Clinic</div>
              <NavItem to="/opd" icon={<Stethoscope size={17} />} label="OPD" onClick={onClose} />
            </>
          )}

          {/* EMR - Admin & Doctor */}
          {(role === "admin" || role === "doctor") && (
            <>
              <div style={sectionLabel}>Records</div>
              <NavItem to="/emr" icon={<ClipboardList size={17} />} label="EMR Timeline" onClick={onClose} />
            </>
          )}

          {/* Hospital - Admin & Nurse */}
          {(role === "admin" || role === "nurse") && (
            <>
              <div style={sectionLabel}>Hospital</div>
              <NavItem to="/ipd" icon={<BedDouble size={17} />} label="IPD" onClick={onClose} />
              <NavItem to="/beds" icon={<Monitor size={17} />} label="Bed Management" onClick={onClose} />
              <NavItem to="/icu" icon={<HeartPulse size={17} />} label="ICU" onClick={onClose} />
              <NavItem to="/discharge" icon={<FileText size={17} />} label="Discharge" onClick={onClose} />
            </>
          )}

          {/* OT - Admin, Doctor, Nurse */}
          {(role === "admin" || role === "doctor" || role === "nurse") && (
            <>
              <div style={sectionLabel}>Surgery</div>
              <NavItem to="/ot" icon={<Scissors size={17} />} label="Operation Theatre" onClick={onClose} />
            </>
          )}

          {/* Services - Lab & Pharmacy */}
          {(role === "admin" || role === "lab_technician" || role === "pharmacist") && (
            <>
              <div style={sectionLabel}>Services</div>
              {(role === "admin" || role === "lab_technician") && (
                <NavItem to="/lab" icon={<FlaskConical size={17} />} label="Laboratory" onClick={onClose} />
              )}
              {(role === "admin" || role === "pharmacist") && (
                <NavItem to="/pharmacy" icon={<Pill size={17} />} label="Pharmacy" onClick={onClose} />
              )}
            </>
          )}

          {/* Management - Admin only */}
          {role === "admin" && (
            <>
              <div style={sectionLabel}>Management</div>
              <NavItem to="/hr" icon={<Activity size={17} />} label="HR" onClick={onClose} />
              <NavItem to="/billing-settings" icon={<Settings size={17} />} label="Settings" onClick={onClose} />
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