import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function BillingSettings() {
  const [fee, setFee] = useState<number>(0);

  useEffect(() => {
    fetchFee();
  }, []);

  const fetchFee = async () => {
    const { data } = await supabase
      .from("hospital_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) setFee(data.consultation_fee);
  };

  const updateFee = async () => {
    const { error } = await supabase
      .from("hospital_settings")
      .update({
        consultation_fee: fee,
        updated_at: new Date()
      })
      .neq("id", "");

    if (error) alert("Update failed");
    else alert("Consultation fee updated");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>OPD Billing Settings</h2>

      <div style={{ marginTop: 20 }}>
        <label>Consultation Fee</label>
        <input
          type="number"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          style={{
            display: "block",
            marginTop: 8,
            padding: 10,
            width: 250
          }}
        />
      </div>

      <button
        onClick={updateFee}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#0f766e",
          color: "white",
          border: "none",
          borderRadius: 6
        }}
      >
        Update Fee
      </button>
    </div>
  );
}