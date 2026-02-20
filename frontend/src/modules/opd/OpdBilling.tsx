import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Appointment = {
  id: string;
  patient_name: string;
  doctor_name: string;
};

export default function OpdBilling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("Cash");

  async function fetchCompletedAppointments() {
    const { data } = await supabase
      .from("opd_appointments")
      .select("id, patient_name, doctor_name")
      .eq("status", "Completed");

    setAppointments(data || []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCompletedAppointments();
  }, []);

  const fetchFee = async (appointmentId: string, doctorName: string) => {
    setSelected(appointmentId);

    const { data } = await supabase
      .from("doctors")
      .select("consultation_fee")
      .eq("name", doctorName)
      .single();

    setFee(data?.consultation_fee || 0);
  };

  const handlePayment = async () => {
    if (!selected) return;

    const { error } = await supabase
      .from("opd_billing")
      .insert([
        {
          appointment_id: selected,
          consultation_fee: fee,
          total_amount: fee,
          payment_status: "Paid",
          payment_mode: paymentMode
        }
      ]);

    if (error) {
      alert("Billing error");
      return;
    }

    alert("Payment Successful");

    setSelected(null);
    setFee(0);
    fetchCompletedAppointments();
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>OPD Billing</h2>

      {appointments.map((a) => (
        <div key={a.id} style={cardStyle}>
          <div>
            <strong>{a.patient_name}</strong>
            <div>Doctor: {a.doctor_name}</div>
          </div>

          <button
            style={buttonStyle}
            onClick={() => fetchFee(a.id, a.doctor_name)}
          >
            Generate Bill
          </button>
        </div>
      ))}

      {selected && (
        <div style={billingBox}>
          <h3>Billing Details</h3>

          <div>Consultation Fee: ₹ {fee}</div>

          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>

          <button style={payBtn} onClick={handlePayment}>
            Mark as Paid
          </button>
        </div>
      )}
    </div>
  );
}

/* Styles */

const cardStyle = {
  background: "white",
  padding: 15,
  marginBottom: 10,
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};

const billingBox = {
  marginTop: 20,
  padding: 20,
  background: "#f1f5f9",
  borderRadius: 10
};

const payBtn = {
  marginTop: 10,
  background: "#16a34a",
  color: "white",
  padding: "8px 14px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};
