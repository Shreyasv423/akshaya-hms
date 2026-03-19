import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function InsuranceDashboard() {
  const [claims, setClaims] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimAmount, setClaimAmount] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    // Requires `insurance_claims` table
    const { data, error } = await supabase
      .from("insurance_claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClaims(data);
    }
    setLoading(false);
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("id, name").order("name");
    if (data) setPatients(data);
  };

  useEffect(() => {
    fetchClaims();
    fetchPatients();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("insurance_claims").insert([
      {
        patient_name: patientName,
        insurance_provider: insuranceProvider,
        policy_number: policyNumber,
        claim_amount: parseFloat(claimAmount),
        status: "Pending" // can be Pending, Approved, Rejected
      }
    ]);

    if (!error) {
      setShowModal(false);
      setPatientName("");
      setInsuranceProvider("");
      setPolicyNumber("");
      setClaimAmount("");
      fetchClaims();
    } else {
      alert("Please ensure the 'insurance_claims' table exists in Supabase.");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("insurance_claims").update({ status: newStatus }).eq("id", id);
    fetchClaims();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' }}>Insurance & TPA Claims</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Track and process cashless requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "#8b5cf6", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          <ShieldAlert size={18} /> New Claim
        </button>
      </div>

      <div style={{ background: "white", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading claims...</p>
        ) : claims.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "#64748b", fontWeight: 500 }}>No claims found.</p>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Ensure `insurance_claims` table exists in Supabase.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {claims.map(claim => (
              <div key={claim.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, position: "relative" }}>
                <div style={{ position: "absolute", top: 20, right: 20 }}>
                  {claim.status === "Approved" ? <CheckCircle size={24} color="#10b981" /> :
                   claim.status === "Rejected" ? <ShieldAlert size={24} color="#ef4444" /> :
                   <Clock size={24} color="#f59e0b" />}
                </div>

                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  Claim #{claim.id}
                </div>
                
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18, color: "#0f172a" }}>{claim.patient_name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#64748b", fontWeight: 500 }}>{claim.insurance_provider} • {claim.policy_number}</p>
                
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Claim Amount</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#0c4a6e" }}>₹{claim.claim_amount?.toLocaleString() || 0}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {claim.status === "Pending" && (
                    <>
                      <button onClick={() => updateStatus(claim.id, "Approved")} style={{ flex: 1, padding: "8px", background: "#ecfdf5", color: "#047857", border: "1px solid #10b981", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Approve</button>
                      <button onClick={() => updateStatus(claim.id, "Rejected")} style={{ flex: 1, padding: "8px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #ef4444", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Reject</button>
                    </>
                  )}
                  {claim.status !== "Pending" && (
                    <div style={{ width: "100%", textAlign: "center", padding: "8px", background: "#f1f5f9", color: "#475569", borderRadius: 6, fontWeight: 600, fontSize: 13 }}>
                      Status: {claim.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 12, width: "100%", maxWidth: 400 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>New TPA Claim</h3>
            <form onSubmit={handleCreateClaim}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Patient Name</label>
                <select required value={patientName} onChange={e => setPatientName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", background: "white" }}>
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Insurance Provider (e.g., Star Health)</label>
                <input required value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Policy / Card Number</label>
                <input required value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Requested Amount (₹)</label>
                <input required type="number" min="0" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#e2e8f0", color: "#334155", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "white", fontWeight: 600, cursor: "pointer" }}>Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
