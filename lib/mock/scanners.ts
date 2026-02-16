import type { Scanner, ScannerState } from "@/lib/types/scanner";

const brands = ["Zebra", "Chafon", "MSI", "Urovo", "Impinj", "Honeywell"];
const models = [
  "MC3300U",
  "RFD40",
  "CF-H907US-2D",
  "R700",
  "RT40S",
  "IH45"
];
const locations = [
  "warehouse - WJKT1",
  "warehouse - WNRT1",
  "warehouse - WSSY1",
  "warehouse - WSEL1",
  "office - Jakarta",
  "office - Taipei"
];

const states: ScannerState[] = ["working", "new", "faulty", "test"];

const dateOf = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  return `2026-02-${day}`;
};

export const scanners: Scanner[] = Array.from({ length: 38 }).map((_, index) => {
  const serial = `SCN${String(202600000 + index * 17).padStart(9, "0")}`;
  const brand = brands[index % brands.length];
  const modelName = models[index % models.length];
  const location = locations[index % locations.length];
  const state = states[index % states.length];
  const createdAt = dateOf(index + 1);
  const updatedAt = dateOf(index + 11);

  return {
    id: `SC-${String(index + 1).padStart(3, "0")}`,
    serialNumber: serial,
    modelName,
    brand,
    location,
    description: `${brand} ${modelName} configured for RFID ${location} operations.`,
    state,
    createdAt,
    updatedAt
  };
});
