
"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { statusBadgeClass } from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useToast } from "@/components/shared/toast-provider";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { customers as mockCustomers } from "@/lib/mock/customers";
import type { Customer, CustomerStatus } from "@/lib/types/customer";

type ColumnVisibility = {
  address: boolean;
  zipCode: boolean;
  country: boolean;
  contactName: boolean;
  contactPhone: boolean;
  contactEmail: boolean;
  status: boolean;
};

type FilterState = {
  status: "all" | CustomerStatus;
  country: string;
  companyName: string;
  contactName: string;
  email: string;
};

type CustomerFormState = {
  companyName: string;
  address: string;
  zipCode: string;
  country: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: CustomerStatus;
};

const defaultFilters: FilterState = {
  status: "all",
  country: "all",
  companyName: "",
  contactName: "",
  email: ""
};

const defaultForm: CustomerFormState = {
  companyName: "",
  address: "",
  zipCode: "",
  country: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  status: "active"
};

export default function CustomerPage() {
  const { toast } = useToast();

  const [customers, setCustomers] = React.useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [formValues, setFormValues] = React.useState<CustomerFormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = React.useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:customers",
    {
      address: true,
      zipCode: true,
      country: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      status: true
    }
  );

  const countryOptions = React.useMemo(() => {
    return Array.from(new Set(customers.map((item) => item.country))).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  const filteredCustomers = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return customers.filter((customer) => {
      if (query) {
        const haystack = [
          customer.companyName,
          customer.contactName,
          customer.contactEmail,
          customer.country,
          customer.address
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (filters.status !== "all" && customer.status !== filters.status) return false;
      if (filters.country !== "all" && customer.country !== filters.country) return false;
      if (filters.companyName.trim() && !customer.companyName.toLowerCase().includes(filters.companyName.toLowerCase().trim())) return false;
      if (filters.contactName.trim() && !customer.contactName.toLowerCase().includes(filters.contactName.toLowerCase().trim())) return false;
      if (filters.email.trim() && !customer.contactEmail.toLowerCase().includes(filters.email.toLowerCase().trim())) return false;
      return true;
    });
  }, [customers, filters, searchQuery]);

  const activeFilterCount = React.useMemo(() => {
    return (
      (filters.status !== "all" ? 1 : 0) +
      (filters.country !== "all" ? 1 : 0) +
      (filters.companyName.trim() ? 1 : 0) +
      (filters.contactName.trim() ? 1 : 0) +
      (filters.email.trim() ? 1 : 0)
    );
  }, [filters]);

  const kpi = React.useMemo(() => {
    const total = customers.length;
    const active = customers.filter((customer) => customer.status === "active").length;
    const inactive = customers.filter((customer) => customer.status === "inactive").length;
    return { total, active, inactive };
  }, [customers]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) setDraftFilters(filters);
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedCustomers = filteredCustomers.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    2 +
    (visibleColumns.address ? 1 : 0) +
    (visibleColumns.zipCode ? 1 : 0) +
    (visibleColumns.country ? 1 : 0) +
    (visibleColumns.contactName ? 1 : 0) +
    (visibleColumns.contactPhone ? 1 : 0) +
    (visibleColumns.contactEmail ? 1 : 0) +
    (visibleColumns.status ? 1 : 0);

  const selectedCustomer = React.useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const resetForm = () => {
    setFormValues(defaultForm);
    setFormError(null);
    setEditingId(null);
    setFormMode("create");
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setFiltersOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setFormMode("edit");
    setEditingId(customer.id);
    setFormValues({
      companyName: customer.companyName,
      address: customer.address,
      zipCode: customer.zipCode,
      country: customer.country,
      contactName: customer.contactName,
      contactPhone: customer.contactPhone,
      contactEmail: customer.contactEmail,
      status: customer.status
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setDetailOpen(true);
  };

  const saveCustomer = () => {
    if (!formValues.companyName.trim()) {
      setFormError("Company Name is required.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingId
            ? {
                ...customer,
                ...formValues,
                companyName: formValues.companyName.trim(),
                updatedAt: now
              }
            : customer
        )
      );

      toast({
        title: "Customer Updated",
        description: `${formValues.companyName.trim()} updated successfully.`,
        variant: "success"
      });
    } else {
      const maxId = customers.reduce((max, customer) => {
        const parsed = Number(customer.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const newCustomer: Customer = {
        id: `CUS-${String(maxId + 1).padStart(3, "0")}`,
        companyName: formValues.companyName.trim(),
        address: formValues.address.trim(),
        zipCode: formValues.zipCode.trim(),
        country: formValues.country.trim(),
        contactName: formValues.contactName.trim(),
        contactPhone: formValues.contactPhone.trim(),
        contactEmail: formValues.contactEmail.trim(),
        status: formValues.status,
        createdAt: now,
        updatedAt: now
      };

      setCustomers((current) => [newCustomer, ...current]);
      toast({
        title: "Customer Created",
        description: `${newCustomer.companyName} added successfully.`,
        variant: "success"
      });
    }

    setFormOpen(false);
    resetForm();
  };

  const toggleStatus = (customer: Customer) => {
    const nextStatus: CustomerStatus = customer.status === "active" ? "inactive" : "active";

    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : item
      )
    );

    toast({
      title: "Status Updated",
      description: `${customer.companyName} is now ${nextStatus}.`,
      variant: "info"
    });
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setCustomers((current) => current.filter((item) => item.id !== deleteCandidate.id));

    toast({
      title: "Customer Deleted",
      description: `${deleteCandidate.companyName} removed from list.`,
      variant: "success"
    });

    if (selectedCustomerId === deleteCandidate.id) {
      setSelectedCustomerId(null);
      setDetailOpen(false);
    }

    setDeleteCandidate(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>Manage customer profile used in requests and shipments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Company Name *</p>
              <Input
                value={formValues.companyName}
                onChange={(event) => setFormValues((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Address</p>
              <Input
                value={formValues.address}
                onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
                placeholder="Enter address"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Zip Code</p>
                <Input
                  value={formValues.zipCode}
                  onChange={(event) => setFormValues((current) => ({ ...current, zipCode: event.target.value }))}
                  placeholder="Zip code"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Country</p>
                <Select
                  value={formValues.country || "none"}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, country: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select country</SelectItem>
                    {countryOptions.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Contact Name</p>
                <Input
                  value={formValues.contactName}
                  onChange={(event) => setFormValues((current) => ({ ...current, contactName: event.target.value }))}
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Contact Phone</p>
                <Input
                  value={formValues.contactPhone}
                  onChange={(event) => setFormValues((current) => ({ ...current, contactPhone: event.target.value }))}
                  placeholder="Contact phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Contact Email</p>
              <Input
                type="email"
                value={formValues.contactEmail}
                onChange={(event) => setFormValues((current) => ({ ...current, contactEmail: event.target.value }))}
                placeholder="Contact email"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select
                value={formValues.status}
                onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as CustomerStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveCustomer}>
              {formMode === "edit" ? "Save Changes" : "Create Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              {deleteCandidate
                ? `Delete ${deleteCandidate.companyName}? This action is mock and cannot be undone.`
                : "Delete selected customer?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedCustomerId(null);
          }
        }}
      >
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-lg">
          {selectedCustomer ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">{selectedCustomer.companyName}</SheetTitle>
                  <div className="flex items-center gap-2">
                    <SheetDescription>{selectedCustomer.country || "-"}</SheetDescription>
                    <Badge className={statusBadgeClass[selectedCustomer.status]}>
                      {selectedCustomer.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Company</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">Address</p>
                    <p className="whitespace-pre-wrap text-foreground">{selectedCustomer.address || "-"}</p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Zip Code</p>
                        <p>{selectedCustomer.zipCode || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Country</p>
                        <p>{selectedCustomer.country || "-"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Name</p>
                      <p>{selectedCustomer.contactName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Phone</p>
                      <p>{selectedCustomer.contactPhone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Email</p>
                      <p>{selectedCustomer.contactEmail || "-"}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Created At</p>
                      <p>{selectedCustomer.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated At</p>
                      <p>{selectedCustomer.updatedAt}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => openEdit(selectedCustomer)}
                >
                  Edit
                </Button>
                <Button variant="outline" onClick={() => toggleStatus(selectedCustomer)}>
                  {selectedCustomer.status === "active" ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedCustomer)}>
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Customer not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles used in requests and shipments."
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add New Customer
            </Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpi.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">All customer profiles in the master list.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpi.active}</p>
            <p className="mt-1 text-xs text-muted-foreground">Customers available for active requests.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpi.inactive}</p>
            <p className="mt-1 text-xs text-muted-foreground">Profiles paused or no longer in use.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search company, contact, email, country..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>Customer Filters</SheetTitle>
                      <SheetDescription>Refine customers by status, location, and contact profile.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <Select
                          value={draftFilters.status}
                          onValueChange={(value) =>
                            setDraftFilters((current) => ({ ...current, status: value as FilterState["status"] }))
                          }
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

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Country</p>
                        <Select
                          value={draftFilters.country}
                          onValueChange={(value) => setDraftFilters((current) => ({ ...current, country: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All countries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {countryOptions.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Company Name</p>
                        <Input
                          placeholder="Filter company name"
                          value={draftFilters.companyName}
                          onChange={(event) => setDraftFilters((current) => ({ ...current, companyName: event.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Contact Name</p>
                        <Input
                          placeholder="Filter contact name"
                          value={draftFilters.contactName}
                          onChange={(event) => setDraftFilters((current) => ({ ...current, contactName: event.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Email</p>
                        <Input
                          placeholder="Filter email"
                          value={draftFilters.email}
                          onChange={(event) => setDraftFilters((current) => ({ ...current, email: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear
                      </Button>
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={applyFilters}>
                        Apply
                      </Button>
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
                    <DropdownMenuCheckboxItem checked={visibleColumns.address} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, address: Boolean(value) }))}>Address</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.zipCode} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, zipCode: Boolean(value) }))}>Zip Code</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.country} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, country: Boolean(value) }))}>Country</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.contactName} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, contactName: Boolean(value) }))}>Contact Name</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.contactPhone} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, contactPhone: Boolean(value) }))}>Contact Phone</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.contactEmail} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, contactEmail: Boolean(value) }))}>Contact Email</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.status} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, status: Boolean(value) }))}>Status</DropdownMenuCheckboxItem>
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
                  Export
                </Button>
              </>
            }
            meta={
              <>
                {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount} filters applied</Badge> : null}
                <span>{filteredCustomers.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  <TableHead className={cellClass}>Company Name</TableHead>
                  {visibleColumns.address ? <TableHead className={cellClass}>Address</TableHead> : null}
                  {visibleColumns.zipCode ? <TableHead className={cellClass}>Zip Code</TableHead> : null}
                  {visibleColumns.country ? <TableHead className={cellClass}>Country</TableHead> : null}
                  {visibleColumns.contactName ? <TableHead className={cellClass}>Contact Name</TableHead> : null}
                  {visibleColumns.contactPhone ? <TableHead className={cellClass}>Contact Phone</TableHead> : null}
                  {visibleColumns.contactEmail ? <TableHead className={cellClass}>Contact Email</TableHead> : null}
                  {visibleColumns.status ? <TableHead className={cellClass}>Status</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedCustomers.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">
                      No customers found with current search and filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedCustomers.map((customer) => (
                    <TableRow key={customer.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openCustomerDetail(customer)}>
                      <TableCell className={`${cellClass} font-medium text-foreground`}>
                        <span className="[display:-webkit-box] max-w-[280px] overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {customer.companyName}
                        </span>
                      </TableCell>
                      {visibleColumns.address ? (
                        <TableCell className={`${cellClass} text-muted-foreground`}>
                          <span className="block max-w-[280px] truncate" title={customer.address}>{customer.address || "-"}</span>
                        </TableCell>
                      ) : null}
                      {visibleColumns.zipCode ? <TableCell className={cellClass}>{customer.zipCode || "-"}</TableCell> : null}
                      {visibleColumns.country ? <TableCell className={cellClass}>{customer.country || "-"}</TableCell> : null}
                      {visibleColumns.contactName ? <TableCell className={cellClass}>{customer.contactName || "-"}</TableCell> : null}
                      {visibleColumns.contactPhone ? <TableCell className={cellClass}>{customer.contactPhone || "-"}</TableCell> : null}
                      {visibleColumns.contactEmail ? (
                        <TableCell className={cellClass}>
                          <span className="block max-w-[220px] truncate" title={customer.contactEmail}>{customer.contactEmail || "-"}</span>
                        </TableCell>
                      ) : null}
                      {visibleColumns.status ? (
                        <TableCell className={cellClass}>
                          <Badge className={`${statusBadgeClass[customer.status]} ${badgeClass}`}>{customer.status === "active" ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                      ) : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openCustomerDetail(customer)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(customer)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(customer)}>{customer.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteCandidate(customer)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredCustomers.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
