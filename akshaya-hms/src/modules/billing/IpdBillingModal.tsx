import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { X } from "lucide-react";

type Props = {
    admission: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function IpdBillingModal({ admission, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [daysStayed, setDaysStayed] = useState(0);
    const [bedChargePerDay, setBedChargePerDay] = useState(0);
    const [additionalCharges, setAdditionalCharges] = useState<{ name: string, amount: number | "" }[]>([]);
    const [discount, setDiscount] = useState<number | "">("");
    const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
    const [paymentMode, setPaymentMode] = useState("Cash");

    useEffect(() => {
        const adDate = new Date(admission.admission_date);
        const disDate = new Date(); // Today
        const diffTime = Math.abs(disDate.getTime() - adDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setDaysStayed(diffDays);

        // Estimate bed charge based on ward name
        const ward = admission.ward || "";
        if (ward.includes("ICU")) setBedChargePerDay(5000);
        else if (ward.includes("Private")) setBedChargePerDay(3000);
        else if (ward.includes("Semi")) setBedChargePerDay(1500);
        else setBedChargePerDay(800);
    }, [admission]);

    const bedTotal = daysStayed * bedChargePerDay;
    const additionalTotal = additionalCharges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const subTotal = bedTotal + additionalTotal;

    const discountVal = Number(discount) || 0;
    const calculatedDiscount = discountType === "percent" ? (subTotal * discountVal) / 100 : discountVal;
    const grandTotal = Math.max(subTotal - calculatedDiscount, 0);

    const addCharge = () => {
        setAdditionalCharges([...additionalCharges, { name: "", amount: "" as number | "" }]);
    };

    const updateCharge = (index: number, field: string, value: any) => {
        const updated = [...additionalCharges];
        (updated[index] as any)[field] = value;
        setAdditionalCharges(updated);
    };

    const handleBillAndDischarge = async () => {
        setLoading(true);

        // 1. Create the bill (Using opd_bills for now but we could create ipd_bills)
        // Since we don't have ipd_bills table, let's use a generic name or just simulated
        const { error: billError } = await supabase.from("opd_bills").insert({
            patient_id: admission.patient_id,
            total_amount: grandTotal,
            consultation_fee: 0,
            discount: calculatedDiscount,
            payment_mode: paymentMode,
            // We can add metadata in a json field if it exists, or just use comments
        });

        if (billError) {
            alert("Error creating bill: " + billError.message);
            setLoading(false);
            return;
        }

        // 2. Update admission status
        await supabase.from("ipd_admissions").update({ status: "Discharged" }).eq("id", admission.id);

        // 3. Free bed
        if (admission.bed_id) {
            await supabase.from("beds").update({ is_occupied: false }).eq("id", admission.bed_id);
        }

        setLoading(false);
        onSuccess();
        onClose();
    };

    return (
        <div style={overlay}>
            <div style={modal}>
                <div style={header}>
                    <h3 style={title}>IPD Billing & Discharge</h3>
                    <button onClick={onClose} style={closeBtn}><X size={20} /></button>
                </div>

                <div style={patientInfo}>
                    <div><strong>Patient:</strong> {admission.patient_name}</div>
                    <div><strong>Admission Date:</strong> {new Date(admission.admission_date).toLocaleDateString()}</div>
                    <div><strong>Bed:</strong> {admission.bed_number} ({admission.ward})</div>
                </div>

                <div style={billingSection}>
                    <div style={calcRow}>
                        <span>Stay Duration</span>
                        <span>{daysStayed} Days</span>
                    </div>
                    <div style={calcRow}>
                        <span>Bed Charge (₹{bedChargePerDay} / day)</span>
                        <span>₹{bedTotal}</span>
                    </div>

                    <div style={divider} />

                    <div style={sectionLabel}>Additional Charges (Surgery, Meds, etc.)</div>
                    {additionalCharges.map((c, i) => (
                        <div key={i} style={addChargeRow}>
                            <input
                                style={inp}
                                placeholder="Charge name"
                                value={c.name}
                                onChange={e => updateCharge(i, "name", e.target.value)}
                            />
                            <input
                                style={{ ...inp, width: 100 }}
                                type="number"
                                placeholder="Amount"
                                value={c.amount === 0 ? "" : c.amount}
                                onChange={e => updateCharge(i, "amount", e.target.value === "" ? "" : Number(e.target.value))}
                            />
                        </div>
                    ))}
                    <button style={addBtn} onClick={addCharge}>+ Add Charge</button>

                    <div style={totalBox}>
                        <div style={{ ...totalRow, fontSize: 14, color: "#475569", marginBottom: 8, fontWeight: 'normal' }}>
                            <span>Subtotal</span>
                            <span>₹{subTotal}</span>
                        </div>
                        <div style={{ ...totalRow, fontSize: 14, color: "#475569", marginBottom: 16, fontWeight: 'normal' }}>
                            <span>Discount</span>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")}
                                    style={{ ...inp, width: "auto", padding: "4px 8px" }}
                                >
                                    <option value="flat">₹</option>
                                    <option value="percent">%</option>
                                </select>
                                <input
                                    type="number"
                                    value={discount === 0 ? "" : discount}
                                    onChange={(e) => setDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                                    style={{ ...inp, width: 70, padding: "4px 8px" }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div style={totalRow}>
                            <span>Total Payable</span>
                            <span style={totalVal}>₹{grandTotal}</span>
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <label style={lbl}>Payment Mode</label>
                            <select style={sel} value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={footer}>
                    <button style={cancelBtn} onClick={onClose}>Cancel</button>
                    <button style={saveBtn} onClick={handleBillAndDischarge} disabled={loading}>
                        {loading ? "Processing..." : "Confirm Payment & Discharge"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modal: React.CSSProperties = { background: "white", padding: 24, borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" };
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 };
const title: React.CSSProperties = { margin: 0, fontSize: 18, color: "#0c4a6e" };
const closeBtn: React.CSSProperties = { border: "none", background: "transparent", cursor: "pointer", color: "#64748b" };

const patientInfo: React.CSSProperties = { background: "#f8fafc", padding: 14, borderRadius: 10, marginBottom: 20, fontSize: 13, display: "grid", gap: 6, color: "#475569" };

const billingSection: React.CSSProperties = { display: "grid", gap: 12 };
const calcRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#475569" };
const divider: React.CSSProperties = { height: 1, background: "#e2e8f0", margin: "8px 0" };
const sectionLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#0c4a6e" };

const addChargeRow: React.CSSProperties = { display: "flex", gap: 10 };
const inp: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, flex: 1 };
const addBtn: React.CSSProperties = { background: "transparent", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 8, cursor: "pointer", fontSize: 12, color: "#64748b" };

const totalBox: React.CSSProperties = { background: "#f0f9ff", padding: 16, borderRadius: 12, marginTop: 10 };
const totalRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const totalVal: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: "#0284c7" };
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 };
const sel: React.CSSProperties = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" };

const footer: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 };
const cancelBtn: React.CSSProperties = { padding: "10px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, cursor: "pointer" };
const saveBtn: React.CSSProperties = { padding: "10px 16px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" };
