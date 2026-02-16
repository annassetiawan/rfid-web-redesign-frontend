export type MasterUnitCategory = "main" | "accessory";
export type MasterUnitStatus = "active" | "inactive";

export type MasterUnit = {
  id: string;
  name: string;
  category: MasterUnitCategory;
  imageUrl?: string;
  status: MasterUnitStatus;
  updatedAt: string;
};
