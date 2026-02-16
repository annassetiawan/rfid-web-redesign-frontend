import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Accessory, InventoryItem, Product } from "@/lib/types/inventory";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MasterUnit } from "@/lib/types/master-unit";
import { categoryBadgeClass, statusBadgeClass } from "@/components/shared/badge-map";
import { getDensityClasses, type DensityMode } from "@/components/shared/use-density";
import { PaginationFooter } from "@/components/shared/pagination-footer";

type InventoryResolved = Product & {
  unit: MasterUnit;
};

type AccessoryResolved = Accessory & {
  unit: MasterUnit;
  mainUnit?: MasterUnit;
};

type InventoryTableProps = {
  items: InventoryResolved[] | AccessoryResolved[];
  type: "product" | "accessory";
  density?: DensityMode;
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const inventoryStatusLabel: Record<InventoryItem["inventoryStatus"], string> = {
  in_stock: "In Stock",
  in_transit: "In Transit",
  assigned: "Assigned"
};

const inventoryStatusBadge: Record<InventoryItem["inventoryStatus"], string> = {
  in_stock: "bg-emerald-50 text-emerald-700",
  in_transit: "bg-blue-50 text-blue-700",
  assigned: "bg-amber-50 text-amber-700"
};

const conditionLabel: Record<InventoryItem["condition"], string> = {
  working: "Working",
  needs_check: "Needs Check",
  damaged: "Damaged"
};

const conditionBadge: Record<InventoryItem["condition"], string> = {
  working: "bg-emerald-50 text-emerald-700",
  needs_check: "bg-amber-50 text-amber-700",
  damaged: "bg-rose-50 text-rose-700"
};

const stagingLabel: Record<InventoryItem["stagingStatus"], string> = {
  pending: "Pending",
  staged: "Staged",
  shipped: "Shipped"
};

const stagingBadge: Record<InventoryItem["stagingStatus"], string> = {
  pending: "bg-slate-100 text-slate-600",
  staged: "bg-blue-50 text-blue-700",
  shipped: "bg-emerald-50 text-emerald-700"
};

const locationLabel: Record<InventoryItem["location"], string> = {
  warehouse: "Warehouse",
  customer_site: "Customer Site"
};

const isAccessoryResolved = (
  item: InventoryResolved | AccessoryResolved
): item is AccessoryResolved => "groupedWith" in item;

const isProductResolved = (
  item: InventoryResolved | AccessoryResolved
): item is InventoryResolved => !isAccessoryResolved(item);

export function InventoryTable({
  items,
  type,
  density = "comfortable",
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange
}: InventoryTableProps) {
  const [selectedItem, setSelectedItem] = React.useState<InventoryResolved | AccessoryResolved | null>(null);
  const visibleItems = React.useMemo(() => {
    if (type === "accessory") {
      return items.filter(isAccessoryResolved);
    }

    return items.filter(isProductResolved);
  }, [items, type]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedItems = visibleItems.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);
  const { rowClass, cellClass, badgeClass, actionBtnClass } = getDensityClasses(density);

  return (
    <div className="rounded-lg border border-border/60">
      <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {selectedItem && (
            <>
              <SheetHeader>
                <div className="flex items-start gap-4">
                  {selectedItem.unit.imageUrl ? (
                    <img
                      src={selectedItem.unit.imageUrl}
                      alt={selectedItem.unit.name}
                      className="h-14 w-14 rounded-lg border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">
                      {selectedItem.unit.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      {selectedItem.unit.name}
                      <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                        {type === "product" ? "Product" : "Accessory"}
                      </Badge>
                    </SheetTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className={categoryBadgeClass[selectedItem.unit.category]}>
                        {selectedItem.unit.category === "main" ? "Main Product" : "Accessory"}
                      </Badge>
                      <Badge className={statusBadgeClass[selectedItem.status]}>{selectedItem.status}</Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="grid gap-5 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Serial</p>
                  <p className="font-medium text-slate-900">{selectedItem.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">RFID</p>
                  <p className="font-medium text-slate-900">{selectedItem.rfidCode}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
                  <p className="font-medium text-slate-900">{locationLabel[selectedItem.location]}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Warehouse</p>
                  <p className="font-medium text-slate-900">{selectedItem.warehouseLocation}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                  <Badge className={statusBadgeClass[selectedItem.status]}>{selectedItem.status}</Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Tagged Date</p>
                  <p className="font-medium text-slate-900">{selectedItem.taggedDate}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Condition</p>
                  <Badge className={conditionBadge[selectedItem.condition]}>
                    {conditionLabel[selectedItem.condition]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Staging</p>
                  <Badge className={stagingBadge[selectedItem.stagingStatus]}>
                    {stagingLabel[selectedItem.stagingStatus]}
                  </Badge>
                </div>
                {type === "accessory" && selectedItem && isAccessoryResolved(selectedItem) && (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Main Unit</p>
                      <p className="font-medium text-slate-900">{selectedItem.mainUnit?.name ?? "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Grouped With</p>
                      <p className="font-medium text-slate-900">{selectedItem.groupedWith || "-"}</p>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold text-slate-800">Activity</p>
                <div className="mt-2 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                  Activity timeline will appear here.
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-4">
                <Button variant="outline">Edit</Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Print label</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Table>
        <TableHeader className="sticky top-0 bg-card/95">
          <TableRow className={rowClass}>
            <TableHead className={cellClass}>Name</TableHead>
            <TableHead className={cellClass}>Serial Number</TableHead>
            <TableHead className={cellClass}>RFID Code</TableHead>
            {type === "accessory" && <TableHead className={cellClass}>Main Unit</TableHead>}
            {type === "accessory" && <TableHead className={cellClass}>Grouped With</TableHead>}
            <TableHead className={cellClass}>Inventory Status</TableHead>
            <TableHead className={cellClass}>Location</TableHead>
            <TableHead className={cellClass}>Condition</TableHead>
            <TableHead className={cellClass}>Staging Status</TableHead>
            <TableHead className={cellClass}>Warehouse Location</TableHead>
            <TableHead className={cellClass}>Tagged Date</TableHead>
            <TableHead className={cellClass}>Status</TableHead>
            <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedItems.map((item) => (
            <TableRow
              key={item.id}
              className={`${rowClass} cursor-pointer hover:bg-muted/40`}
              onClick={() => setSelectedItem(item)}
            >
              <TableCell className={`${cellClass} font-medium text-foreground`}>{item.unit.name}</TableCell>
              <TableCell className={cellClass}>{item.serialNumber}</TableCell>
              <TableCell className={cellClass}>{item.rfidCode}</TableCell>
              {type === "accessory" && isAccessoryResolved(item) && (
                <TableCell className={cellClass}>{item.mainUnit?.name ?? "Unknown"}</TableCell>
              )}
              {type === "accessory" && isAccessoryResolved(item) && (
                <TableCell className={cellClass}>{item.groupedWith || "-"}</TableCell>
              )}
              <TableCell className={cellClass}>
                <Badge className={`${inventoryStatusBadge[item.inventoryStatus]} ${badgeClass}`}>
                  {inventoryStatusLabel[item.inventoryStatus]}
                </Badge>
              </TableCell>
              <TableCell className={cellClass}>{locationLabel[item.location]}</TableCell>
              <TableCell className={cellClass}>
                <Badge className={`${conditionBadge[item.condition]} ${badgeClass}`}>
                  {conditionLabel[item.condition]}
                </Badge>
              </TableCell>
              <TableCell className={cellClass}>
                <Badge className={`${stagingBadge[item.stagingStatus]} ${badgeClass}`}>
                  {stagingLabel[item.stagingStatus]}
                </Badge>
              </TableCell>
              <TableCell className={cellClass}>{item.warehouseLocation}</TableCell>
              <TableCell className={cellClass}>{item.taggedDate}</TableCell>
              <TableCell className={cellClass}>
                <Badge className={`${statusBadgeClass[item.status]} ${badgeClass}`}>{item.status}</Badge>
              </TableCell>
              <TableCell className={`${cellClass} text-right`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={actionBtnClass}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedItem(item)}>View details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Export row</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter
        pageSize={pageSize}
        pageIndex={pageIndex}
        totalCount={visibleItems.length}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
