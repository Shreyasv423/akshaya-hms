import {
  Users,
  Stethoscope,
  BedDouble,
  Building2
} from "lucide-react";

type Props = {
  role: string;
};

const Item = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 8,
      cursor: "pointer",
      color: "#e5e7eb"
    }}
    onMouseOver={e => (e.currentTarget.style.background = "#1e293b")}
    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
  >
    {icon}
    <span>{label}</span>
  </div>
);

export default function Sidebar({ role }: Props) {
  return (
    <div
      style={{
        width: 240,
        background: "#020617",
        padding: 16,
        color: "white"
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          Akshaya Hospitals
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          {role.toUpperCase()}
        </div>
      </div>

      <Item label="Patients" icon={<Users size={18} />} />

      {(role === "admin" || role === "doctor" || role === "reception") && (
        <Item label="OPD" icon={<Stethoscope size={18} />} />
      )}

      {(role === "admin" || role === "doctor" || role === "nurse") && (
        <Item label="IPD" icon={<BedDouble size={18} />} />
      )}

      {(role === "admin" || role === "hr") && (
        <Item label="HR" icon={<Building2 size={18} />} />
      )}
    </div>
  );
}
