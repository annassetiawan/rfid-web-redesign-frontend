import type { Accessory, Product } from "@/lib/types/inventory";
import type { MasterUnit } from "@/lib/types/master-unit";
import type { LocalRequest } from "@/lib/types/request";
import type { UnitRelation } from "@/lib/types/unit-relation";

export type SearchType = "all" | "requests" | "units" | "inventory" | "relations";

export type SearchRequestResult = LocalRequest;

export type SearchUnitResult = MasterUnit;

export type SearchInventoryResult = (Product | Accessory) & {
  unitName: string;
};

export type SearchRelationResult = UnitRelation & {
  mainProductName: string;
  accessoriesLabel: string[];
};
