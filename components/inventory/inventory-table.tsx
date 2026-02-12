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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type InventoryTableProps = {
  items: Product[] | Accessory[];
  type: "product" | "accessory";
  density?: "compact" | "comfortable";
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const statusBadge: Record<InventoryItem["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600"
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

export function InventoryTable({
  items,
  type,
  density = "comfortable",
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange
}: InventoryTableProps) {
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | Accessory | null>(null);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedItems = items.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);
  const rowClassName = density === "compact" ? "h-9" : "h-11";
  const cellClassName = density === "compact" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  const badgeClassName = density === "compact" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs";
  const actionBtnClassName = density === "compact" ? "h-8 w-8" : "h-9 w-9";

  return (
    <div className="rounded-lg border border-border/60">
      <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedItem.name}
                  <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                    {type === "product" ? "Product" : "Accessory"}
                  </Badge>
                </SheetTitle>
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
                  <Badge className={statusBadge[selectedItem.status]}>{selectedItem.status}</Badge>
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
                {type === "accessory" && (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Main Unit</p>
                      <p className="font-medium text-slate-900">{(selectedItem as Accessory).mainUnit}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Grouped With</p>
                      <p className="font-medium text-slate-900">{(selectedItem as Accessory).groupedWith}</p>
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
          <TableRow className={rowClassName}>
            <TableHead className={cellClassName}>Name</TableHead>
            <TableHead className={cellClassName}>Serial Number</TableHead>
            <TableHead className={cellClassName}>RFID Code</TableHead>
            {type === "accessory" && <TableHead className={cellClassName}>Main Unit</TableHead>}
            {type === "accessory" && <TableHead className={cellClassName}>Grouped With</TableHead>}
            <TableHead className={cellClassName}>Inventory Status</TableHead>
            <TableHead className={cellClassName}>Location</TableHead>
            <TableHead className={cellClassName}>Condition</TableHead>
            <TableHead className={cellClassName}>Staging Status</TableHead>
            <TableHead className={cellClassName}>Warehouse Location</TableHead>
            <TableHead className={cellClassName}>Tagged Date</TableHead>
            <TableHead className={cellClassName}>Status</TableHead>
            <TableHead className={`${cellClassName} text-right`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedItems.map((item) => (
            <TableRow
              key={item.id}
              className={`${rowClassName} cursor-pointer hover:bg-muted/40`}
              onClick={() => setSelectedItem(item)}
            >
              <TableCell className={`${cellClassName} font-medium text-foreground`}>{item.name}</TableCell>
              <TableCell className={cellClassName}>{item.serialNumber}</TableCell>
              <TableCell className={cellClassName}>{item.rfidCode}</TableCell>
              {type === "accessory" && <TableCell className={cellClassName}>{(item as Accessory).mainUnit}</TableCell>}
              {type === "accessory" && <TableCell className={cellClassName}>{(item as Accessory).groupedWith}</TableCell>}
              <TableCell className={cellClassName}>
                <Badge className={`${inventoryStatusBadge[item.inventoryStatus]} ${badgeClassName}`}>
                  {inventoryStatusLabel[item.inventoryStatus]}
                </Badge>
              </TableCell>
              <TableCell className={cellClassName}>{locationLabel[item.location]}</TableCell>
              <TableCell className={cellClassName}>
                <Badge className={`${conditionBadge[item.condition]} ${badgeClassName}`}>
                  {conditionLabel[item.condition]}
                </Badge>
              </TableCell>
              <TableCell className={cellClassName}>
                <Badge className={`${stagingBadge[item.stagingStatus]} ${badgeClassName}`}>
                  {stagingLabel[item.stagingStatus]}
                </Badge>
              </TableCell>
              <TableCell className={cellClassName}>{item.warehouseLocation}</TableCell>
              <TableCell className={cellClassName}>{item.taggedDate}</TableCell>
              <TableCell className={cellClassName}>
                <Badge className={`${statusBadge[item.status]} ${badgeClassName}`}>{item.status}</Badge>
              </TableCell>
              <TableCell className={`${cellClassName} text-right`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={actionBtnClassName}
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            className="h-8 rounded-md border border-border/60 bg-background px-2 text-sm text-foreground"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={clampedPageIndex === 1}
                onClick={() => onPageChange(Math.max(1, clampedPageIndex - 1))}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{clampedPageIndex}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                disabled={clampedPageIndex === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, clampedPageIndex + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
