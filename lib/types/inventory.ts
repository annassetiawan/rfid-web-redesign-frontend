export type InventoryStatus = "in_stock" | "in_transit" | "assigned";
export type InventoryLocation = "warehouse" | "customer_site";
export type InventoryCondition = "working" | "needs_check" | "damaged";
export type StagingStatus = "pending" | "staged" | "shipped";
export type InventoryActiveStatus = "active" | "inactive";

export type InventoryItem = {
  id: string;
  unitId: string;
  serialNumber: string;
  rfidCode: string;
  inventoryStatus: InventoryStatus;
  location: InventoryLocation;
  condition: InventoryCondition;
  stagingStatus: StagingStatus;
  warehouseLocation: string;
  taggedDate: string;
  status: InventoryActiveStatus;
};

export type Product = InventoryItem;

export type Accessory = InventoryItem & {
  mainUnitId: string;
  groupedWith: string;
};
