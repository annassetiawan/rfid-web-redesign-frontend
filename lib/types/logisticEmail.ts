export type LogisticEmailType = "warehouse" | "cc";

export type LogisticEmail = {
  id: string;
  name: string;
  email: string;
  warehouseLocation: string;
  type: LogisticEmailType;
  createdAt: string;
  updatedAt: string;
};
