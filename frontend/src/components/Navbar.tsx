import { LogOut } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Navbar() {
  return (
    <div
      style={{
        height: 56,
        background: "white",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px"
      }}
    >
      <strong>Akshaya Hospitals — HMS</strong>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
