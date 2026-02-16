import type { MasterUnitStatus } from "@/lib/types/master-unit";

export type UnitRelationStatus = MasterUnitStatus;

export type UnitRelation = {
  id: string;
  mainUnitId: string;
  accessoryUnitIds: string[];
  status: UnitRelationStatus;
  updatedAt: string;
  updatedBy: string;
};
