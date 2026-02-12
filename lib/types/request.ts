export type RequestStatus = "new" | "inprogress" | "processed";

export type RequestType = "delivery" | "pickup";

export type LocalRequest = {
  id: string;
  requestNumber: string;
  warehouse: string;
  customerCompany: string;
  email: string;
  requestType: RequestType;
  isAdditional?: boolean;
  requestDate: string;
  lastUpdate: string;
  status: RequestStatus;
};
