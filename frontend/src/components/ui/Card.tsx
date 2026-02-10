export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16
      }}
    >
      {children}
    </div>
  );
}
