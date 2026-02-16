export type CycleCountCategory = "product" | "accessory" | "all";

export type CycleCountStatus = "new" | "inprogress" | "processed" | "cancelled";

export type CycleCountSession = {
  id: string;
  category: CycleCountCategory;
  createdAt: string;
  operatorName: string;
  warehouseCode: string;
  status: CycleCountStatus;
  totalInventory: number;
  scannedCount: number;
  unscannedCount: number;
  untaggedCount: number;
};
