import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

type Props = {
  patient: any;
  onClose: () => void;
};

export default function OpdBillingModal({ patient, onClose }: Props) {
  const [consultationFee, setConsultationFee] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFee();
  }, []);

  const fetchFee = async () => {
    const { data } = await supabase
      .from("hospital_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) setConsultationFee(data.consultation_fee);
  };

  const addService = () => {
    setServices([...services, { service_name: "", quantity: 1, price: 0 }]);
  };

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const removeService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const subtotal =
    consultationFee +
    services.reduce((sum, s) => sum + s.quantity * s.price, 0);

  const total = Math.max(subtotal - discount, 0);

  const saveBill = async () => {
    setSaving(true);

    const { data: bill, error } = await supabase
      .from("opd_bills")
      .insert({
        patient_id: patient.patient_id,
        consultation_fee: consultationFee,
        discount,
        total_amount: total,
        payment_mode: paymentMode
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    if (services.length > 0) {
      const items = services.map((s) => ({
        bill_id: bill.id,
        service_name: s.service_name,
        quantity: s.quantity,
        price: s.price,
        subtotal: s.quantity * s.price
      }));

      await supabase.from("opd_bill_items").insert(items);
    }

    setSaving(false);
    onClose();
  };

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>OPD Billing</h2>
          <p style={subText}>
            {patient.patient_name} | {patient.phone}
          </p>
        </div>
        <button onClick={onClose} style={closeBtn}>✕</button>
      </div>

      {/* Charges */}
      <div style={card}>
        <h4 style={sectionTitle}>Consultation</h4>
        <input
          type="number"
          value={consultationFee}
          onChange={(e) => setConsultationFee(Number(e.target.value))}
          style={input}
        />

        <h4 style={{ ...sectionTitle, marginTop: 20 }}>Additional Services</h4>

        <button onClick={addService} style={addBtn}>
          + Add Service
        </button>

        {services.length > 0 && (
          <table style={table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td>
                    <input
                      style={input}
                      placeholder="Service"
                      onChange={(e) =>
                        updateService(i, "service_name", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={s.quantity}
                      style={input}
                      onChange={(e) =>
                        updateService(i, "quantity", Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={s.price}
                      style={input}
                      onChange={(e) =>
                        updateService(i, "price", Number(e.target.value))
                      }
                    />
                  </td>
                  <td>₹{s.quantity * s.price}</td>
                  <td>
                    <button onClick={() => removeService(i)} style={removeBtn}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div style={summaryCard}>
        <div style={summaryRow}>
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div style={summaryRow}>
          <span>Discount</span>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            style={{ ...input, width: 100 }}
          />
        </div>

        <div style={totalRow}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <div style={{ marginTop: 15 }}>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            style={input}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div style={footer}>
        <button style={cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button style={saveBtn} onClick={saveBill} disabled={saving}>
          {saving ? "Saving..." : "Save Bill"}
        </button>
      </div>
    </div>
  );
}

/* Styles */

const container = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 20
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const subText = {
  fontSize: 14,
  color: "#64748b"
};

const closeBtn = {
  border: "none",
  background: "transparent",
  fontSize: 20,
  cursor: "pointer"
};

const card = {
  padding: 20,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e2e8f0"
};

const sectionTitle = {
  marginBottom: 10,
  fontSize: 15
};

const input = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  width: "100%"
};

const addBtn = {
  marginBottom: 10,
  padding: "6px 12px",
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const removeBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  padding: "4px 8px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const
};

const summaryCard = {
  padding: 20,
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #e2e8f0"
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 700,
  fontSize: 18,
  marginTop: 10
};

const footer = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10
};

const cancelBtn = {
  padding: "8px 16px",
  background: "#e5e7eb",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};

const saveBtn = {
  padding: "8px 16px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};