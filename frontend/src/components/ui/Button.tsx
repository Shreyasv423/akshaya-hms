import { motion } from "framer-motion";

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...props}
      style={{
        background: "#0f4c81",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
        ...props.style
      }}
    />
  );
}
