export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: string;
  companyName: string;
  address: string;
  zipCode: string;
  country: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};
