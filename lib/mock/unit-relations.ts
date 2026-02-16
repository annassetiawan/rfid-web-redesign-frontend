import type { UnitRelation } from "@/lib/types/unit-relation";

export const unitRelations: UnitRelation[] = [
  {
    id: "UR-001",
    mainUnitId: "MU-001",
    accessoryUnitIds: ["MU-101", "MU-104", "MU-106", "MU-109"],
    status: "active",
    updatedAt: "2026-02-13",
    updatedBy: "demo.user"
  },
  {
    id: "UR-002",
    mainUnitId: "MU-002",
    accessoryUnitIds: ["MU-102", "MU-105", "MU-108"],
    status: "active",
    updatedAt: "2026-02-12",
    updatedBy: "demo.user"
  },
  {
    id: "UR-003",
    mainUnitId: "MU-003",
    accessoryUnitIds: ["MU-103", "MU-104"],
    status: "inactive",
    updatedAt: "2026-02-11",
    updatedBy: "admin.eva"
  },
  {
    id: "UR-004",
    mainUnitId: "MU-004",
    accessoryUnitIds: ["MU-101", "MU-105", "MU-110"],
    status: "active",
    updatedAt: "2026-02-10",
    updatedBy: "admin.eva"
  },
  {
    id: "UR-005",
    mainUnitId: "MU-005",
    accessoryUnitIds: ["MU-102", "MU-106", "MU-107", "MU-109", "MU-110"],
    status: "active",
    updatedAt: "2026-02-09",
    updatedBy: "demo.user"
  }
];
