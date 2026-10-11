export interface BasePatient {
  id: string;
  name: string;
  uhid?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
}

/**
 * Returns a unique, human-readable patient identifier for any patient.
 * Prioritizes stored `uhid` if present. If not yet in DB, generates a deterministic
 * 6-character uppercase code from the patient's UUID primary key (e.g., PID-8A2F10).
 */
export function getPatientIdentifier(patient: { id?: string; uhid?: string | null }): string {
  if (patient.uhid && patient.uhid.trim()) {
    return patient.uhid.trim().toUpperCase();
  }
  if (patient.id) {
    const clean = patient.id.replace(/-/g, "").toUpperCase();
    return `PID-${clean.slice(0, 6)}`;
  }
  return "PID-NEW";
}

/**
 * Generates a new unique hospital registration code (UHID).
 * Format: AKSH-XXXXXX (e.g., AKSH-582910)
 */
export function generateUHID(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `AKSH-${randomDigits}`;
}

/**
 * Formats a patient for dropdowns and selectors, ensuring staff can clearly
 * distinguish between patients who have the same name or share the same family phone number.
 * Example: "Ramesh Kumar [PID-8A2F10] • 📞 9876543210 • (45y, Male)"
 */
export function formatPatientOption(patient: BasePatient): string {
  const idStr = getPatientIdentifier(patient);
  const phoneStr = patient.phone ? ` • 📞 ${patient.phone}` : " • No Phone";
  const ageGenderParts = [
    patient.age ? `${patient.age}y` : "",
    patient.gender || ""
  ].filter(Boolean);
  const ageGenderStr = ageGenderParts.length > 0 ? ` • (${ageGenderParts.join(", ")})` : "";

  return `${patient.name} [${idStr}]${phoneStr}${ageGenderStr}`;
}
