import type { MasterUnitCategory, MasterUnitStatus } from "@/lib/types/master-unit";
import type { RequestStatus, RequestType } from "@/lib/types/request";
import type { CycleCountCategory, CycleCountStatus } from "@/lib/types/cycle-count";
import type { CycleCountItemScanStatus } from "@/lib/types/cycle-count-item";

export const statusBadgeClass: Record<MasterUnitStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600"
};

export const categoryBadgeClass: Record<MasterUnitCategory, string> = {
  main: "bg-indigo-50 text-indigo-700",
  accessory: "bg-sky-50 text-sky-700"
};

export const requestStatusBadgeClass: Record<RequestStatus, string> = {
  new: "bg-amber-100 text-amber-700",
  inprogress: "bg-blue-100 text-blue-700",
  processed: "bg-emerald-100 text-emerald-700"
};

export const requestTypeBadgeClass: Record<RequestType, string> = {
  delivery: "bg-emerald-50 text-emerald-700",
  pickup: "bg-blue-50 text-blue-700"
};

export const cycleCountStatusBadgeClass: Record<CycleCountStatus, string> = {
  new: "bg-amber-100 text-amber-700",
  inprogress: "bg-blue-100 text-blue-700",
  processed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
};

export const cycleCountCategoryBadgeClass: Record<CycleCountCategory, string> = {
  product: "bg-indigo-50 text-indigo-700",
  accessory: "bg-sky-50 text-sky-700",
  all: "bg-slate-100 text-slate-700"
};

export const cycleCountItemScanStatusBadgeClass: Record<CycleCountItemScanStatus, string> = {
  scanned: "bg-emerald-100 text-emerald-700",
  unscanned: "bg-amber-100 text-amber-700",
  untagged: "bg-rose-100 text-rose-700"
};
