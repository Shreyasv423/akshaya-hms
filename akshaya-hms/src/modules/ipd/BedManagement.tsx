import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { BedDouble, CheckCircle2, XCircle } from "lucide-react";

type Bed = {
    id: string;
    bed_number: string;
    ward: string;
    is_occupied: boolean;
};

export default function BedManagement() {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);

    const fetchBeds = async () => {
        setLoading(true);
        const { data } = await supabase.from("beds").select("*").order("bed_number");
        setBeds(data || []);
        setLoading(false);
        return data;
    };

    useEffect(() => {
        fetchBeds().then(data => {
            if (data && data.length === 0) {
                initialize25Beds();
            }
        });
    }, []);

    const initialize25Beds = async () => {
        if (initializing) return;
        setInitializing(true);
        const newBeds = [];

        // 10 General Ward
        for (let i = 1; i <= 10; i++) {
            newBeds.push({ bed_number: `G-${i}`, ward: "General Ward", is_occupied: false });
        }
        // 5 Semi-Private
        for (let i = 1; i <= 5; i++) {
            newBeds.push({ bed_number: `SP-${i}`, ward: "Semi-Private", is_occupied: false });
        }
        // 5 Private
        for (let i = 1; i <= 5; i++) {
            newBeds.push({ bed_number: `P-${i}`, ward: "Private", is_occupied: false });
        }
        // 5 ICU
        for (let i = 1; i <= 5; i++) {
            newBeds.push({ bed_number: `ICU-${i}`, ward: "ICU", is_occupied: false });
        }

        const { error } = await supabase.from("beds").insert(newBeds);
        if (!error) {
            fetchBeds();
        }
        setInitializing(false);
    };

    const wards = Array.from(new Set(beds.map(b => b.ward)));

    return (
        <div>
            <div style={header}>
                <div>
                    <h2 style={title}>Bed Management</h2>
                    <p style={subtitle}>Visual layout of hospital bed occupancy</p>
                </div>
                {initializing && <span style={{ fontSize: 13, color: "#0ea5e9" }}>Initializing 25 beds...</span>}
            </div>

            {loading && !initializing ? (
                <div style={emptyState}>Loading hospital layout...</div>
            ) : beds.length === 0 ? (
                <div style={emptyState}>
                    <p>Initializing hospital layout...</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 32 }}>
                    {wards.map(ward => (
                        <section key={ward}>
                            <h3 style={wardTitle}>{ward}</h3>
                            <div style={bedGrid}>
                                {beds.filter(b => b.ward === ward).map(bed => (
                                    <div key={bed.id} style={bedCard(bed.is_occupied)}>
                                        <div style={bedIcon(bed.is_occupied)}>
                                            <BedDouble size={24} />
                                        </div>
                                        <div>
                                            <div style={bedNum}>Bed {bed.bed_number}</div>
                                            <div style={statusBadge(bed.is_occupied)}>
                                                {bed.is_occupied ? (
                                                    <><XCircle size={12} /> Occupied</>
                                                ) : (
                                                    <><CheckCircle2 size={12} /> Available</>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 };
const title: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: "#0c4a6e", margin: 0 };
const subtitle: React.CSSProperties = { fontSize: 14, color: "#64748b", margin: "4px 0 0 0" };

const wardTitle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "2px solid #e2e8f0"
};

const bedGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16
};

const bedCard = (isOccupied: boolean): React.CSSProperties => ({
    background: "white",
    padding: 16,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: isOccupied ? "1px solid #fee2e2" : "1px solid #f1f5f9",
    transition: "transform 0.2s ease"
});

const bedIcon = (isOccupied: boolean): React.CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isOccupied ? "#fee2e2" : "#f0fdf4",
    color: isOccupied ? "#ef4444" : "#10b981",
});

const bedNum: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "#1e293b" };

const statusBadge = (isOccupied: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 600,
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4,
    color: isOccupied ? "#ef4444" : "#10b981"
});

const emptyState: React.CSSProperties = { textAlign: "center", padding: 60, color: "#94a3b8" };
