export type ScannerState = "new" | "working" | "faulty" | "test";

export type Scanner = {
  id: string;
  serialNumber: string;
  modelName: string;
  brand: string;
  location: string;
  description: string;
  state: ScannerState;
  createdAt: string;
  updatedAt: string;
};
