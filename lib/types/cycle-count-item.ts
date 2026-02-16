export type CycleCountItemScanStatus = "scanned" | "unscanned" | "untagged";
export type CycleCountItemLocation = "warehouse" | "staging" | "customer_site";
export type CycleCountItemCondition = "good" | "needs_check" | "damaged";

export type CycleCountItem = {
  id: string;
  cycleCountId: string;
  name: string;
  serialNumber: string;
  labelRfid: string;
  scanStatus: CycleCountItemScanStatus;
  location: CycleCountItemLocation;
  condition: CycleCountItemCondition;
  updatedAt: string;
  imageUrl?: string;
};
