import { cycleCountSessions } from "@/lib/mock/cycle-count";
import type {
  CycleCountItem,
  CycleCountItemCondition,
  CycleCountItemLocation,
  CycleCountItemScanStatus
} from "@/lib/types/cycle-count-item";

const itemNamePool = [
  "PAN-M-600",
  "PAN-WF-500-B-OSS",
  "PAN-XR-300",
  "PAN-PA-3200",
  "PAN-PA-5400",
  "Power Cord",
  "Rack Mount Kit",
  "Console Cable",
  "Optical SFP Module",
  "RFID Label Pack",
  "Spare Fan Module",
  "Rail Kit"
];

const scanStatuses: CycleCountItemScanStatus[] = ["scanned", "unscanned", "untagged"];
const locations: CycleCountItemLocation[] = ["warehouse", "staging", "customer_site"];
const conditions: CycleCountItemCondition[] = ["good", "needs_check", "damaged"];

const toDate = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  const hour = (8 + (seed % 10)).toString().padStart(2, "0");
  const minute = (seed % 60).toString().padStart(2, "0");
  return `2026-02-${day} ${hour}:${minute}`;
};

const buildItemsForSession = (cycleCountId: string, sessionIndex: number): CycleCountItem[] => {
  return Array.from({ length: 50 }).map((_, itemIndex) => {
    const seed = sessionIndex * 100 + itemIndex;
    const status = scanStatuses[seed % scanStatuses.length];
    const location = locations[seed % locations.length];
    const condition = conditions[seed % conditions.length];
    const name = itemNamePool[seed % itemNamePool.length];

    return {
      id: `CCI-${(seed + 1).toString().padStart(5, "0")}`,
      cycleCountId,
      name,
      serialNumber: `SN-${cycleCountId.slice(-3)}-${(itemIndex + 1).toString().padStart(3, "0")}`,
      labelRfid: `RFID-${cycleCountId.slice(-3)}-${(itemIndex + 1).toString().padStart(3, "0")}`,
      scanStatus: status,
      location,
      condition,
      updatedAt: toDate(seed),
      imageUrl: itemIndex % 10 === 0 ? `https://placehold.co/64x64?text=${encodeURIComponent(name.slice(0, 4))}` : undefined
    };
  });
};

export const cycleCountItems: CycleCountItem[] = cycleCountSessions.flatMap((session, index) =>
  buildItemsForSession(session.id, index)
);
