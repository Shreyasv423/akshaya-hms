import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabase";

type Patient = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
};

type ServiceItem = {
  name: string;
  amount: number;
};

type Admission = {
  id: string;
  patient_name: string;
  admission_date: string | null;
  discharge_date: string | null;
};

const opServiceSuggestions = ["Injection", "Dressing", "Procedure"];

export default function OpdBilling() {
  const [activeTab, setActiveTab] = useState<"OPD" | "IPD">("OPD");

  // OPD state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [consultationFee, setConsultationFee] = useState(0);
  const [opdServices, setOpdServices] = useState<ServiceItem[]>([]);
  const [opdServiceName, setOpdServiceName] = useState("");
  const [opdServiceAmount, setOpdServiceAmount] = useState(0);
  const [opdPaymentMode, setOpdPaymentMode] = useState("Cash");
  const [opdSaving, setOpdSaving] = useState(false);

  // IPD state
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [admissionId, setAdmissionId] = useState("");
  const [roomRentPerDay, setRoomRentPerDay] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [ipdServices, setIpdServices] = useState<ServiceItem[]>([]);
  const [ipdServiceName, setIpdServiceName] = useState("");
  const [ipdServiceAmount, setIpdServiceAmount] = useState(0);
  const [ipdSaving, setIpdSaving] = useState(false);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? null,
    [patients, patientId]
  );

  const opdServicesTotal = useMemo(
    () => opdServices.reduce((sum, item) => sum + item.amount, 0),
    [opdServices]
  );

  const opdTotal = consultationFee + opdServicesTotal;

  const selectedAdmission = useMemo(
    () => admissions.find((a) => a.id === admissionId) ?? null,
    [admissions, admissionId]
  );

  const ipdServicesTotal = useMemo(
    () => ipdServices.reduce((sum, item) => sum + item.amount, 0),
    [ipdServices]
  );

  const roomTotal = roomRentPerDay * numberOfDays;
  const grandTotal = roomTotal + ipdServicesTotal;
  const balanceDue = grandTotal - advancePaid;

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, name, age, gender")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Unable to load patients");
      return;
    }

    setPatients(data || []);
  };

  const fetchAdmissions = async () => {
    const { data, error } = await supabase
      .from("ipd_admissions")
      .select("id, patient_name, admission_date, discharge_date")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Unable to load IPD admissions");
      return;
    }

    setAdmissions(data || []);
  };

  useEffect(() => {
    void fetchPatients();
    void fetchAdmissions();
  }, []);

  useEffect(() => {
    if (!selectedAdmission) return;

    const admissionDate = selectedAdmission.admission_date
      ? new Date(selectedAdmission.admission_date)
      : null;

    const dischargeDate = selectedAdmission.discharge_date
      ? new Date(selectedAdmission.discharge_date)
      : new Date();

    if (admissionDate && !Number.isNaN(admissionDate.getTime())) {
      const diffMs = dischargeDate.getTime() - admissionDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setNumberOfDays(Math.max(diffDays, 1));
      return;
    }

    setNumberOfDays(1);
  }, [selectedAdmission]);

  const addOpdService = () => {
    if (!opdServiceName.trim() || opdServiceAmount <= 0) return;

    setOpdServices((prev) => [
      ...prev,
      { name: opdServiceName.trim(), amount: opdServiceAmount }
    ]);

    setOpdServiceName("");
    setOpdServiceAmount(0);
  };

  const addIpdService = () => {
    if (!ipdServiceName.trim() || ipdServiceAmount <= 0) return;

    setIpdServices((prev) => [
      ...prev,
      { name: ipdServiceName.trim(), amount: ipdServiceAmount }
    ]);

    setIpdServiceName("");
    setIpdServiceAmount(0);
  };

  const saveOpdBill = async () => {
    if (!patientId) {
      alert("Please select a patient");
      return;
    }

    setOpdSaving(true);

    const { data: bill, error: billError } = await supabase
      .from("opd_bills")
      .insert([
        {
          patient_id: patientId,
          consultation_fee: consultationFee,
          services_total: opdServicesTotal,
          total_amount: opdTotal,
          payment_mode: opdPaymentMode
        }
      ])
      .select("id")
      .single();

    if (billError || !bill) {
      alert(billError?.message || "Error while saving OPD bill");
      setOpdSaving(false);
      return;
    }

    if (opdServices.length > 0) {
      const { error: servicesError } = await supabase.from("opd_services").insert(
        opdServices.map((item) => ({
          bill_id: bill.id,
          service_name: item.name,
          amount: item.amount
        }))
      );

      if (servicesError) {
        alert(servicesError.message);
        setOpdSaving(false);
        return;
      }
    }

    alert("OPD bill generated successfully");
    setPatientId("");
    setConsultationFee(0);
    setOpdServices([]);
    setOpdPaymentMode("Cash");
    setOpdSaving(false);
  };

  const saveIpdBill = async () => {
    if (!admissionId) {
      alert("Please select an admission");
      return;
    }

    setIpdSaving(true);

    const { data: bill, error: billError } = await supabase
      .from("ipd_bills")
      .insert([
        {
          admission_id: admissionId,
          room_rent_per_day: roomRentPerDay,
          number_of_days: numberOfDays,
          room_total: roomTotal,
          services_total: ipdServicesTotal,
          advance_paid: advancePaid,
          grand_total: grandTotal,
          balance_due: balanceDue
        }
      ])
      .select("id")
      .single();

    if (billError || !bill) {
      alert(billError?.message || "Error while saving IPD bill");
      setIpdSaving(false);
      return;
    }

    if (ipdServices.length > 0) {
      const { error: servicesError } = await supabase.from("ipd_services").insert(
        ipdServices.map((item) => ({
          bill_id: bill.id,
          service_name: item.name,
          amount: item.amount,
          date_added: new Date().toISOString()
        }))
      );

      if (servicesError) {
        alert(servicesError.message);
        setIpdSaving(false);
        return;
      }
    }

    alert("IPD bill generated successfully");
    setAdmissionId("");
    setRoomRentPerDay(0);
    setNumberOfDays(1);
    setAdvancePaid(0);
    setIpdServices([]);
    setIpdSaving(false);
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ marginTop: 0 }}>Billing Desk</h2>

      <div style={tabsStyle}>
        <button
          style={activeTab === "OPD" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("OPD")}
        >
          OPD Billing
        </button>
        <button
          style={activeTab === "IPD" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("IPD")}
        >
          IPD Billing
        </button>
      </div>

      {activeTab === "OPD" ? (
        <div style={threeColLayout}>
          <section style={cardStyle}>
            <h3 style={sectionTitle}>Patient</h3>
            <select
              style={inputStyle}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div style={metaText}>
              Age: {selectedPatient?.age ?? "-"} | Gender: {selectedPatient?.gender ?? "-"}
            </div>

            <label style={labelStyle}>Consultation Fee</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value) || 0)}
            />

            <label style={labelStyle}>Payment Mode</label>
            <select
              style={inputStyle}
              value={opdPaymentMode}
              onChange={(e) => setOpdPaymentMode(e.target.value)}
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitle}>Add Services</h3>
            <select
              style={inputStyle}
              value={opdServiceName}
              onChange={(e) => setOpdServiceName(e.target.value)}
            >
              <option value="">Select Service</option>
              {opServiceSuggestions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              style={inputStyle}
              placeholder="Or type custom service"
              value={opdServiceName}
              onChange={(e) => setOpdServiceName(e.target.value)}
            />
            <input
              style={inputStyle}
              type="number"
              min={0}
              placeholder="Amount"
              value={opdServiceAmount}
              onChange={(e) => setOpdServiceAmount(Number(e.target.value) || 0)}
            />
            <button style={secondaryButtonStyle} onClick={addOpdService}>
              Add Service
            </button>

            <div style={listStyle}>
              {opdServices.length === 0 ? (
                <div style={metaText}>No services added.</div>
              ) : (
                opdServices.map((item, index) => (
                  <div key={`${item.name}-${index}`} style={listRowStyle}>
                    <span>{item.name}</span>
                    <span>₹ {item.amount}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitle}>Bill Summary</h3>
            <div style={listRowStyle}>
              <span>Consultation</span>
              <span>₹ {consultationFee}</span>
            </div>
            <div style={listRowStyle}>
              <span>Services Total</span>
              <span>₹ {opdServicesTotal}</span>
            </div>
            <hr />
            <div style={totalStyle}>
              <span>Total Amount</span>
              <span>₹ {opdTotal}</span>
            </div>

            <button
              style={primaryButtonStyle}
              onClick={saveOpdBill}
              disabled={opdSaving}
            >
              {opdSaving ? "Saving..." : "Generate Bill & Save"}
            </button>
          </section>
        </div>
      ) : (
        <div style={twoColLayout}>
          <section style={cardStyle}>
            <h3 style={sectionTitle}>IPD Billing Inputs</h3>

            <label style={labelStyle}>Select Admission</label>
            <select
              style={inputStyle}
              value={admissionId}
              onChange={(e) => setAdmissionId(e.target.value)}
            >
              <option value="">Select Admission</option>
              {admissions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patient_name}
                </option>
              ))}
            </select>

            <div style={metaText}>Selected Patient: {selectedAdmission?.patient_name || "-"}</div>

            <label style={labelStyle}>Room Rent / Day</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={roomRentPerDay}
              onChange={(e) => setRoomRentPerDay(Number(e.target.value) || 0)}
            />

            <label style={labelStyle}>Number of Days</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Math.max(Number(e.target.value) || 1, 1))}
            />

            <label style={labelStyle}>Advance Paid</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={advancePaid}
              onChange={(e) => setAdvancePaid(Number(e.target.value) || 0)}
            />

            <hr />
            <h4 style={{ marginBottom: 8 }}>Daily Services</h4>
            <input
              style={inputStyle}
              placeholder="Service Name"
              value={ipdServiceName}
              onChange={(e) => setIpdServiceName(e.target.value)}
            />
            <input
              style={inputStyle}
              type="number"
              min={0}
              placeholder="Amount"
              value={ipdServiceAmount}
              onChange={(e) => setIpdServiceAmount(Number(e.target.value) || 0)}
            />
            <button style={secondaryButtonStyle} onClick={addIpdService}>
              Add Service
            </button>

            <div style={listStyle}>
              {ipdServices.map((item, index) => (
                <div key={`${item.name}-${index}`} style={listRowStyle}>
                  <span>{item.name}</span>
                  <span>₹ {item.amount}</span>
                </div>
              ))}
              {ipdServices.length === 0 && <div style={metaText}>No services added.</div>}
            </div>
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitle}>IPD Summary</h3>
            <div style={listRowStyle}>
              <span>Room Total</span>
              <span>₹ {roomTotal}</span>
            </div>
            <div style={listRowStyle}>
              <span>Services Total</span>
              <span>₹ {ipdServicesTotal}</span>
            </div>
            <div style={listRowStyle}>
              <span>Grand Total</span>
              <span>₹ {grandTotal}</span>
            </div>
            <div style={listRowStyle}>
              <span>Advance Paid</span>
              <span>₹ {advancePaid}</span>
            </div>
            <hr />
            <div style={totalStyle}>
              <span>Balance Due</span>
              <span>₹ {balanceDue}</span>
            </div>

            <button
              style={primaryButtonStyle}
              onClick={saveIpdBill}
              disabled={ipdSaving}
            >
              {ipdSaving ? "Saving..." : "Generate IPD Bill & Save"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

const pageStyle = {
  padding: 24
};

const tabsStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 16
};

const tabStyle = {
  background: "#e2e8f0",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer"
};

const activeTabStyle = {
  ...tabStyle,
  background: "#2563eb",
  color: "white"
};

const threeColLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 16
};

const twoColLayout = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 16
};

const cardStyle = {
  background: "white",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  padding: 16,
  display: "grid",
  gap: 10,
  alignContent: "start"
};

const sectionTitle = {
  margin: 0,
  marginBottom: 4
};

const labelStyle = {
  fontWeight: 600,
  fontSize: 14,
  marginTop: 4
};

const inputStyle = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1"
};

const metaText = {
  color: "#64748b",
  fontSize: 13
};

const secondaryButtonStyle = {
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer"
};

const primaryButtonStyle = {
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  marginTop: 8
};

const listStyle = {
  display: "grid",
  gap: 6,
  marginTop: 6
};

const listRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8
};

const totalStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 700,
  fontSize: 18
};
