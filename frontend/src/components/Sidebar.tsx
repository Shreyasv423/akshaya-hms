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

const linkBase = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 500,
  marginBottom: 6
};

export default function Sidebar({ role }: Props) {
  return (
    <div
      style={{
        width: 240,
        background: "#e0f2fe",
        padding: 16,
        borderRight: "1px solid #bae6fd",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Role Badge */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20,
          color: "#0369a1"
        }}
      >
        🔐 Role: {role?.toUpperCase()}
      </div>

      {/* ADMIN + RECEPTION */}
      {(role === "admin" || role === "reception") && (
        <>
          <NavLink
            to="/patients"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "#bae6fd" : "transparent",
              color: "#0c4a6e"
            })}
          >
            <Users size={18} /> Patients
          </NavLink>

          <NavLink
            to="/opd"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "#bae6fd" : "transparent",
              color: "#0c4a6e"
            })}
          >
            <Stethoscope size={18} /> OPD
          </NavLink>
        </>
      )}

      {/* DOCTOR ONLY OPD */}
      {role === "doctor" && (
        <NavLink
          to="/opd"
          style={({ isActive }) => ({
            ...linkBase,
            background: isActive ? "#bae6fd" : "transparent",
            color: "#0c4a6e"
          })}
        >
          <Stethoscope size={18} /> OPD
        </NavLink>
      )}

      {/* ADMIN ONLY */}
      {role === "admin" && (
        <>
          <NavLink
            to="/ipd"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "#bae6fd" : "transparent",
              color: "#0c4a6e"
            })}
          >
            <BedDouble size={18} /> IPD
          </NavLink>

          <NavLink
            to="/discharge"
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? "#bae6fd" : "transparent",
              color: "#0c4a6e"
            })}
          >
            <FileText size={18} /> Discharge
          </NavLink>
        </>
      )}
    </div>
  );
}
