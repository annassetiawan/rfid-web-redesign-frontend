"use client";

import * as React from "react";
import { Columns3, Download, Filter, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useDensity } from "@/components/shared/use-density";
import type { InventoryItem } from "@/lib/types/inventory";
import type { MasterUnit } from "@/lib/types/master-unit";
import { accessories, products } from "@/lib/mock/inventory";
import { masterUnits } from "@/lib/mock/master-units";

const fallbackUnit: MasterUnit = {
  id: "unknown",
  name: "Unknown Unit",
  category: "main",
  status: "inactive",
  updatedAt: "-"
};

const locationLabel: Record<InventoryItem["location"], string> = {
  warehouse: "Warehouse",
  customer_site: "Customer Site"
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = React.useState<"products" | "accessories">("products");
  const [filters, setFilters] = React.useState({
    inventoryStatus: "all",
    location: "all",
    condition: "all",
    stagingStatus: "all",
    warehouseLocation: "all",
    taggedFrom: "",
    taggedTo: "",
    status: "all",
    mainUnit: "",
    groupedWith: ""
  });
  const [search, setSearch] = React.useState("");
  const { density, setDensity } = useDensity("comfortable");
  const [pageSizeProducts, setPageSizeProducts] = React.useState(10);
  const [pageIndexProducts, setPageIndexProducts] = React.useState(1);
  const [pageSizeAccessories, setPageSizeAccessories] = React.useState(10);
  const [pageIndexAccessories, setPageIndexAccessories] = React.useState(1);

  const unitMap = React.useMemo(() => new Map(masterUnits.map((unit) => [unit.id, unit])), []);
  const resolveUnit = React.useCallback((unitId: string) => unitMap.get(unitId) ?? fallbackUnit, [unitMap]);

  const resolvedProducts = React.useMemo(() => {
    return products.map((item) => ({ ...item, unit: resolveUnit(item.unitId) }));
  }, [resolveUnit]);

  const resolvedAccessories = React.useMemo(() => {
    return accessories.map((item) => ({
      ...item,
      unit: resolveUnit(item.unitId),
      mainUnit: unitMap.get(item.mainUnitId)
    }));
  }, [resolveUnit, unitMap]);

  const filteredProducts = React.useMemo(() => {
    return resolvedProducts.filter((item) => {
      if (filters.inventoryStatus !== "all" && item.inventoryStatus !== filters.inventoryStatus) return false;
      if (filters.location !== "all" && item.location !== filters.location) return false;
      if (filters.condition !== "all" && item.condition !== filters.condition) return false;
      if (filters.stagingStatus !== "all" && item.stagingStatus !== filters.stagingStatus) return false;
      if (filters.warehouseLocation !== "all" && item.warehouseLocation !== filters.warehouseLocation) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.taggedFrom && new Date(item.taggedDate) < new Date(filters.taggedFrom)) return false;
      if (filters.taggedTo && new Date(item.taggedDate) > new Date(filters.taggedTo)) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const haystack = [
          item.unit.name,
          item.serialNumber,
          item.rfidCode,
          item.warehouseLocation,
          locationLabel[item.location]
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [filters, resolvedProducts, search]);

  const filteredAccessories = React.useMemo(() => {
    return resolvedAccessories.filter((item) => {
      if (filters.inventoryStatus !== "all" && item.inventoryStatus !== filters.inventoryStatus) return false;
      if (filters.location !== "all" && item.location !== filters.location) return false;
      if (filters.condition !== "all" && item.condition !== filters.condition) return false;
      if (filters.stagingStatus !== "all" && item.stagingStatus !== filters.stagingStatus) return false;
      if (filters.warehouseLocation !== "all" && item.warehouseLocation !== filters.warehouseLocation) return false;
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.taggedFrom && new Date(item.taggedDate) < new Date(filters.taggedFrom)) return false;
      if (filters.taggedTo && new Date(item.taggedDate) > new Date(filters.taggedTo)) return false;
      if (filters.mainUnit && !item.mainUnit?.name.toLowerCase().includes(filters.mainUnit.toLowerCase())) return false;
      if (filters.groupedWith && !item.groupedWith.toLowerCase().includes(filters.groupedWith.toLowerCase())) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const haystack = [
          item.unit.name,
          item.serialNumber,
          item.rfidCode,
          item.warehouseLocation,
          locationLabel[item.location],
          item.mainUnit?.name ?? ""
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [filters, resolvedAccessories, search]);

  const activeFiltersCount = React.useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === "mainUnit" || key === "groupedWith") {
        if (activeTab === "products") return count;
      }
      if (
        key === "inventoryStatus" ||
        key === "location" ||
        key === "condition" ||
        key === "stagingStatus" ||
        key === "warehouseLocation" ||
        key === "status"
      ) {
        return value !== "all" ? count + 1 : count;
      }
      return value ? count + 1 : count;
    }, 0);
  }, [filters, activeTab]);

  const handleClearFilters = () => {
    setFilters({
      inventoryStatus: "all",
      location: "all",
      condition: "all",
      stagingStatus: "all",
      warehouseLocation: "all",
      taggedFrom: "",
      taggedTo: "",
      status: "all",
      mainUnit: "",
      groupedWith: ""
    });
  };

  React.useEffect(() => {
    setPageIndexProducts(1);
    setPageIndexAccessories(1);
  }, [filters, activeTab, pageSizeProducts, pageSizeAccessories, search]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory"
        title="Inventory List"
        subtitle="Track products and accessories across warehouse locations."
      />

      <Separator />

      <Tabs
        defaultValue="products"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value as "products" | "accessories")}
      >
        <TabsList className="w-fit">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>

        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Inventory Table</CardTitle>
              <p className="text-sm text-muted-foreground">Unified view with filters and export tools.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableToolbar
              searchPlaceholder="Search name, serial, RFID, location..."
              searchValue={search}
              onSearchChange={setSearch}
              actions={
                <>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-9">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col gap-6 px-6 pb-6">
                      <SheetHeader>
                        <SheetTitle>Advanced Filters</SheetTitle>
                        <SheetDescription>Filter inventory by status, location, or condition.</SheetDescription>
                      </SheetHeader>
                      <div className="mt-2 space-y-6">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Inventory Status</p>
                          <Select
                            value={filters.inventoryStatus}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, inventoryStatus: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="in_stock">In Stock</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Location</p>
                          <Select
                            value={filters.location}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All locations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="warehouse">Warehouse</SelectItem>
                              <SelectItem value="customer_site">Customer Site</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Condition</p>
                          <Select
                            value={filters.condition}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, condition: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All conditions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="working">Working</SelectItem>
                              <SelectItem value="needs_check">Needs Check</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Staging Status</p>
                          <Select
                            value={filters.stagingStatus}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, stagingStatus: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All staging status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="staged">Staged</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Warehouse Location</p>
                          <Select
                            value={filters.warehouseLocation}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, warehouseLocation: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All warehouses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="UPS Korea">UPS Korea</SelectItem>
                              <SelectItem value="UPS Taiwan">UPS Taiwan</SelectItem>
                              <SelectItem value="UPS Japan">UPS Japan</SelectItem>
                              <SelectItem value="UPS Singapore">UPS Singapore</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Tagged Date</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              type="date"
                              value={filters.taggedFrom}
                              onChange={(event) => setFilters((prev) => ({ ...prev, taggedFrom: event.target.value }))}
                            />
                            <Input
                              type="date"
                              value={filters.taggedTo}
                              onChange={(event) => setFilters((prev) => ({ ...prev, taggedTo: event.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">Status</p>
                          <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {activeTab === "accessories" && (
                          <>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-700">Main Unit</p>
                              <Input
                                placeholder="Search main unit"
                                value={filters.mainUnit}
                                onChange={(event) => setFilters((prev) => ({ ...prev, mainUnit: event.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-700">Grouped With</p>
                              <Input
                                placeholder="Search grouped with"
                                value={filters.groupedWith}
                                onChange={(event) => setFilters((prev) => ({ ...prev, groupedWith: event.target.value }))}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                        <Button variant="outline" onClick={handleClearFilters}>
                          Clear
                        </Button>
                        <Button>Apply</Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-9">
                        <Columns3 className="h-4 w-4" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Serial</DropdownMenuItem>
                      <DropdownMenuItem>RFID</DropdownMenuItem>
                      <DropdownMenuItem>Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-9">
                        <SlidersHorizontal className="h-4 w-4" />
                        Density: {density === "compact" ? "Compact" : "Comfortable"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Row Density</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDensity("compact")}>Compact</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDensity("comfortable")}>Comfortable</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="h-9">
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </>
              }
              meta={
                <>
                  {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount} filters applied</Badge>}
                  <span>{activeTab === "products" ? filteredProducts.length : filteredAccessories.length} results</span>
                </>
              }
            />

            <TabsContent value="products">
              <InventoryTable
                items={filteredProducts}
                type="product"
                density={density}
                pageSize={pageSizeProducts}
                pageIndex={pageIndexProducts}
                onPageChange={setPageIndexProducts}
                onPageSizeChange={setPageSizeProducts}
              />
            </TabsContent>

            <TabsContent value="accessories">
              <InventoryTable
                items={filteredAccessories}
                type="accessory"
                density={density}
                pageSize={pageSizeAccessories}
                pageIndex={pageIndexAccessories}
                onPageChange={setPageIndexAccessories}
                onPageSizeChange={setPageSizeAccessories}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
