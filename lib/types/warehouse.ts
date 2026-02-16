export type WarehouseStatus = "active" | "inactive";

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
};
