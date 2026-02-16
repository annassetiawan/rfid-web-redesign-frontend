
"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { ticketPriorityBadgeClass, ticketStatusBadgeClass, ticketTypeBadgeClass } from "@/components/shared/badge-map";
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
import { Textarea } from "@/components/ui/textarea";
import { tickets as mockTickets } from "@/lib/mock/tickets";
import { users as mockUsers } from "@/lib/mock/users";
import type { Ticket, TicketCommentVisibility, TicketPriority, TicketStatus, TicketType } from "@/lib/types/ticket";

type ColumnVisibility = {
  ticketId: boolean;
  subject: boolean;
  requestor: boolean;
  type: boolean;
  category: boolean;
  created: boolean;
  status: boolean;
  priority: boolean;
};

type FilterState = {
  status: "all" | TicketStatus;
  priority: "all" | TicketPriority;
  type: "all" | TicketType;
  category: string;
  createdFrom: string;
  createdTo: string;
};

type TicketFormState = {
  subject: string;
  requestorName: string;
  requestorEmail: string;
  type: TicketType;
  category: string;
  subcategory: string;
  description: string;
  priority: TicketPriority;
};

const defaultFilters: FilterState = {
  status: "all",
  priority: "all",
  type: "all",
  category: "all",
  createdFrom: "",
  createdTo: ""
};

const defaultForm: TicketFormState = {
  subject: "",
  requestorName: "",
  requestorEmail: "",
  type: "request",
  category: "Request",
  subcategory: "",
  description: "",
  priority: "medium"
};

const statusLabel: Record<TicketStatus, string> = {
  open: "Open",
  "in-progress": "In Progress",
  resolved: "Resolved",
  closed: "Closed"
};

const priorityLabel: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
};

const typeLabel: Record<TicketType, string> = {
  bug: "Bug",
  request: "Request",
  question: "Question"
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportCenterPage() {
  const { toast } = useToast();

  const [tickets, setTickets] = React.useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<TicketFormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = React.useState<Ticket | null>(null);
  const [commentMessage, setCommentMessage] = React.useState("");
  const [commentVisibility, setCommentVisibility] = React.useState<TicketCommentVisibility>("public");

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:support-tickets",
    {
      ticketId: true,
      subject: true,
      requestor: true,
      type: true,
      category: true,
      created: true,
      status: true,
      priority: true
    }
  );

  const selectedTicket = React.useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const categories = React.useMemo(() => Array.from(new Set(tickets.map((ticket) => ticket.category))), [tickets]);
  const assigneeOptions = React.useMemo(() => Array.from(new Set(mockUsers.map((user) => user.name))), []);

  const filteredTickets = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return tickets.filter((ticket) => {
      if (query) {
        const haystack = [ticket.id, ticket.subject, ticket.requestorName, ticket.requestorEmail].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.status !== "all" && ticket.status !== filters.status) return false;
      if (filters.priority !== "all" && ticket.priority !== filters.priority) return false;
      if (filters.type !== "all" && ticket.type !== filters.type) return false;
      if (filters.category !== "all" && ticket.category !== filters.category) return false;
      if (filters.createdFrom && new Date(ticket.createdAt) < new Date(filters.createdFrom)) return false;
      if (filters.createdTo && new Date(ticket.createdAt) > new Date(filters.createdTo)) return false;
      return true;
    });
  }, [filters, searchQuery, tickets]);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.status !== "all" ? 1 : 0) +
      (filters.priority !== "all" ? 1 : 0) +
      (filters.type !== "all" ? 1 : 0) +
      (filters.category !== "all" ? 1 : 0) +
      (filters.createdFrom ? 1 : 0) +
      (filters.createdTo ? 1 : 0),
    [filters]
  );

  const kpi = React.useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === "open").length;
    const inProgress = tickets.filter((ticket) => ticket.status === "in-progress").length;
    const resolved = tickets.filter((ticket) => ticket.status === "resolved").length;
    return { open, inProgress, resolved, avgResponse: "2h 10m" };
  }, [tickets]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) setDraftFilters(filters);
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedTickets = filteredTickets.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    (visibleColumns.ticketId ? 1 : 0) +
    (visibleColumns.subject ? 1 : 0) +
    (visibleColumns.requestor ? 1 : 0) +
    (visibleColumns.type ? 1 : 0) +
    (visibleColumns.category ? 1 : 0) +
    (visibleColumns.created ? 1 : 0) +
    (visibleColumns.status ? 1 : 0) +
    (visibleColumns.priority ? 1 : 0) +
    1;

  const resetForm = () => {
    setFormMode("create");
    setEditingId(null);
    setFormValues(defaultForm);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (ticket: Ticket) => {
    setFormMode("edit");
    setEditingId(ticket.id);
    setFormValues({
      subject: ticket.subject,
      requestorName: ticket.requestorName,
      requestorEmail: ticket.requestorEmail,
      type: ticket.type,
      category: ticket.category,
      subcategory: ticket.subcategory,
      description: ticket.description,
      priority: ticket.priority
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openDetail = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
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

  const saveTicket = () => {
    const subject = formValues.subject.trim();
    const requestorName = formValues.requestorName.trim();
    const requestorEmail = formValues.requestorEmail.trim().toLowerCase();
    const description = formValues.description.trim();

    if (!subject || !requestorName || !requestorEmail || !description) {
      setFormError("Subject, Requestor Name, Requestor Email, and Description are required.");
      return;
    }

    if (!emailRegex.test(requestorEmail)) {
      setFormError("Requestor Email format is invalid.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === editingId
            ? {
                ...ticket,
                subject,
                requestorName,
                requestorEmail,
                type: formValues.type,
                category: formValues.category,
                subcategory: formValues.subcategory.trim(),
                description,
                priority: formValues.priority,
                updatedAt: now
              }
            : ticket
        )
      );
      toast({ title: "Ticket Updated", description: `${editingId} updated successfully.`, variant: "success" });
    } else {
      const maxId = tickets.reduce((max, ticket) => {
        const parsed = Number(ticket.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const id = `TCK-2026-${String(maxId + 1).padStart(4, "0")}`;
      const newTicket: Ticket = {
        id,
        subject,
        requestorName,
        requestorEmail,
        type: formValues.type,
        category: formValues.category,
        subcategory: formValues.subcategory.trim(),
        description,
        status: "open",
        priority: formValues.priority,
        assignee: undefined,
        createdAt: now,
        updatedAt: now,
        comments: []
      };

      setTickets((current) => [newTicket, ...current]);
      setSelectedTicketId(id);
      setDetailOpen(true);
      toast({ title: "Ticket Created", description: `${id} created successfully.`, variant: "success" });
    }

    setFormOpen(false);
    resetForm();
  };

  const setTicketStatus = (ticket: Ticket, status: TicketStatus) => {
    setTickets((current) =>
      current.map((item) => (item.id === ticket.id ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) } : item))
    );
    toast({ title: "Status Updated", description: `${ticket.id} marked as ${statusLabel[status].toLowerCase()}.`, variant: "info" });
  };

  const setTicketPriority = (ticket: Ticket, priority: TicketPriority) => {
    setTickets((current) =>
      current.map((item) => (item.id === ticket.id ? { ...item, priority, updatedAt: new Date().toISOString().slice(0, 10) } : item))
    );
    toast({ title: "Priority Updated", description: `${ticket.id} priority set to ${priorityLabel[priority].toLowerCase()}.`, variant: "info" });
  };

  const assignTicket = (ticket: Ticket, assignee: string) => {
    setTickets((current) =>
      current.map((item) => (item.id === ticket.id ? { ...item, assignee: assignee || undefined, updatedAt: new Date().toISOString().slice(0, 10) } : item))
    );
    toast({ title: "Assignee Updated", description: `${ticket.id} assigned to ${assignee || "Unassigned"}.`, variant: "info" });
  };

  const addComment = () => {
    if (!selectedTicket || !commentMessage.trim()) {
      return;
    }

    const comment = {
      id: `${selectedTicket.id}-C${selectedTicket.comments.length + 1}`,
      author: "Current User",
      message: commentMessage.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      visibility: commentVisibility
    } as const;

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              comments: [...ticket.comments, comment],
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : ticket
      )
    );

    setCommentMessage("");
    setCommentVisibility("public");
    toast({ title: "Comment Added", description: `Comment added to ${selectedTicket.id}.`, variant: "success" });
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setTickets((current) => current.filter((ticket) => ticket.id !== deleteCandidate.id));
    toast({ title: "Ticket Deleted", description: `${deleteCandidate.id} removed.`, variant: "success" });

    if (selectedTicketId === deleteCandidate.id) {
      setSelectedTicketId(null);
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Edit Ticket" : "Create Ticket"}</DialogTitle>
            <DialogDescription>Create and track support tickets for RFID operations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Subject *</p>
              <Input value={formValues.subject} onChange={(event) => setFormValues((current) => ({ ...current, subject: event.target.value }))} placeholder="Enter ticket subject" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Requestor Name *</p>
                <Input value={formValues.requestorName} onChange={(event) => setFormValues((current) => ({ ...current, requestorName: event.target.value }))} placeholder="Enter requestor name" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Requestor Email *</p>
                <Input type="email" value={formValues.requestorEmail} onChange={(event) => setFormValues((current) => ({ ...current, requestorEmail: event.target.value }))} placeholder="Enter requestor email" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <Select value={formValues.type} onValueChange={(value) => setFormValues((current) => ({ ...current, type: value as TicketType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="bug">Bug</SelectItem><SelectItem value="request">Request</SelectItem><SelectItem value="question">Question</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Priority</p>
                <Select value={formValues.priority} onValueChange={(value) => setFormValues((current) => ({ ...current, priority: value as TicketPriority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <Select value={formValues.category} onValueChange={(value) => setFormValues((current) => ({ ...current, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Subcategory</p>
                <Input value={formValues.subcategory} onChange={(event) => setFormValues((current) => ({ ...current, subcategory: event.target.value }))} placeholder="Optional subcategory" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Description *</p>
              <Textarea value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the issue or request" />
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveTicket}>{formMode === "edit" ? "Save Changes" : "Create Ticket"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>{deleteCandidate ? `Delete ${deleteCandidate.id}? This action is mock and cannot be undone.` : "Delete selected ticket?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTicketId(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-xl">
          {selectedTicket ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">{selectedTicket.id} • {selectedTicket.subject}</SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={ticketStatusBadgeClass[selectedTicket.status]}>{statusLabel[selectedTicket.status]}</Badge>
                    <Badge className={ticketPriorityBadgeClass[selectedTicket.priority]}>{priorityLabel[selectedTicket.priority]}</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Overview</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Type</p><Badge className={ticketTypeBadgeClass[selectedTicket.type]}>{typeLabel[selectedTicket.type]}</Badge></div>
                    <div><p className="text-xs text-muted-foreground">Category</p><p>{selectedTicket.category}</p></div>
                    <div><p className="text-xs text-muted-foreground">Subcategory</p><p>{selectedTicket.subcategory || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Requestor</p><p>{selectedTicket.requestorName} ({selectedTicket.requestorEmail})</p></div>
                    <div><p className="text-xs text-muted-foreground">Assignee</p><p>{selectedTicket.assignee || "Unassigned"}</p></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{selectedTicket.description}</p>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Activity / Comments</h3>
                  <div className="mt-3 space-y-3">
                    {selectedTicket.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : (
                      selectedTicket.comments.map((comment) => (
                        <div key={comment.id} className="rounded-md border border-border/60 p-3">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>{comment.author}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{comment.visibility}</Badge>
                              <span>{comment.createdAt}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm">{comment.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Textarea value={commentMessage} onChange={(event) => setCommentMessage(event.target.value)} placeholder="Add comment" />
                    <div className="flex items-center justify-between gap-2">
                      <Select value={commentVisibility} onValueChange={(value) => setCommentVisibility(value as TicketCommentVisibility)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="internal">Internal</SelectItem></SelectContent>
                      </Select>
                      <Button onClick={addComment}>Add Comment</Button>
                    </div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Select value={selectedTicket.status} onValueChange={(value) => setTicketStatus(selectedTicket, value as TicketStatus)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                </Select>
                <Select value={selectedTicket.assignee || "unassigned"} onValueChange={(value) => assignTicket(selectedTicket, value === "unassigned" ? "" : value)}>
                  <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assigneeOptions.map((assignee) => (<SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setTicketPriority(selectedTicket, selectedTicket.priority === "urgent" ? "high" : "urgent")}>Toggle Priority</Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(selectedTicket)}>Edit</Button>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedTicket)}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Ticket not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Support Center"
        subtitle="Create and track support tickets for RFID operations."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}><Plus className="h-4 w-4" />Create Ticket</Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Tickets</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.open}</p><p className="mt-1 text-xs text-muted-foreground">Awaiting investigation.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.inProgress}</p><p className="mt-1 text-xs text-muted-foreground">Currently handled by support.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.resolved}</p><p className="mt-1 text-xs text-muted-foreground">Resolved this period.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Response</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.avgResponse}</p><p className="mt-1 text-xs text-muted-foreground">Mock support response metric.</p></CardContent></Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search ticket, subject, requestor..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9"><Filter className="h-4 w-4" />Filters{activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}</Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>Ticket Filters</SheetTitle>
                      <SheetDescription>Filter tickets by status, priority, type, category and date.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2"><p className="text-sm font-medium">Status</p><Select value={draftFilters.status} onValueChange={(value) => setDraftFilters((current) => ({ ...current, status: value as FilterState["status"] }))}><SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in-progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Priority</p><Select value={draftFilters.priority} onValueChange={(value) => setDraftFilters((current) => ({ ...current, priority: value as FilterState["priority"] }))}><SelectTrigger><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Type</p><Select value={draftFilters.type} onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value as FilterState["type"] }))}><SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="bug">Bug</SelectItem><SelectItem value="request">Request</SelectItem><SelectItem value="question">Question</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Category</p><Select value={draftFilters.category} onValueChange={(value) => setDraftFilters((current) => ({ ...current, category: value }))}><SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{categories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Created Date</p><div className="grid grid-cols-2 gap-2"><Input type="date" value={draftFilters.createdFrom} onChange={(event) => setDraftFilters((current) => ({ ...current, createdFrom: event.target.value }))} /><Input type="date" value={draftFilters.createdTo} onChange={(event) => setDraftFilters((current) => ({ ...current, createdTo: event.target.value }))} /></div></div>
                    </div>

                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={clearFilters}>Reset</Button>
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={applyFilters}>Apply</Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" className="h-9"><Columns3 className="h-4 w-4" />Columns</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={visibleColumns.ticketId} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, ticketId: Boolean(value) }))}>Ticket ID</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.subject} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, subject: Boolean(value) }))}>Subject</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.requestor} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, requestor: Boolean(value) }))}>Requestor</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.type} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, type: Boolean(value) }))}>Type</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.category} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, category: Boolean(value) }))}>Category/Subcategory</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.created} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, created: Boolean(value) }))}>Created</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.status} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, status: Boolean(value) }))}>Status</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.priority} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, priority: Boolean(value) }))}>Priority</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" className="h-9"><SlidersHorizontal className="h-4 w-4" />Density: {density === "compact" ? "Compact" : "Comfortable"}</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuLabel>Row Density</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setDensity("compact")}>Compact</DropdownMenuItem><DropdownMenuItem onClick={() => setDensity("comfortable")}>Comfortable</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="h-9"><Download className="h-4 w-4" />Export</Button>
              </>
            }
            meta={
              <>
                {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount} filters</Badge> : null}
                <span>{filteredTickets.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  {visibleColumns.ticketId ? <TableHead className={cellClass}>Ticket ID</TableHead> : null}
                  {visibleColumns.subject ? <TableHead className={cellClass}>Subject</TableHead> : null}
                  {visibleColumns.requestor ? <TableHead className={cellClass}>Requestor</TableHead> : null}
                  {visibleColumns.type ? <TableHead className={cellClass}>Type</TableHead> : null}
                  {visibleColumns.category ? <TableHead className={cellClass}>Category/Subcategory</TableHead> : null}
                  {visibleColumns.created ? <TableHead className={cellClass}>Created</TableHead> : null}
                  {visibleColumns.status ? <TableHead className={cellClass}>Status</TableHead> : null}
                  {visibleColumns.priority ? <TableHead className={cellClass}>Priority</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTickets.length === 0 ? (
                  <TableRow className={rowClass}><TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">No tickets found.</TableCell></TableRow>
                ) : (
                  pagedTickets.map((ticket) => (
                    <TableRow key={ticket.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openDetail(ticket)}>
                      {visibleColumns.ticketId ? <TableCell className={`${cellClass} font-mono text-xs`}>{ticket.id}</TableCell> : null}
                      {visibleColumns.subject ? <TableCell className={`${cellClass} font-medium`}>{ticket.subject}</TableCell> : null}
                      {visibleColumns.requestor ? <TableCell className={cellClass}><p>{ticket.requestorName}</p><p className="text-xs text-muted-foreground">{ticket.requestorEmail}</p></TableCell> : null}
                      {visibleColumns.type ? <TableCell className={cellClass}><Badge className={`${ticketTypeBadgeClass[ticket.type]} ${badgeClass}`}>{typeLabel[ticket.type]}</Badge></TableCell> : null}
                      {visibleColumns.category ? <TableCell className={cellClass}><span className="block max-w-[220px] truncate" title={`${ticket.category} / ${ticket.subcategory}`}>{ticket.category} / {ticket.subcategory || "-"}</span></TableCell> : null}
                      {visibleColumns.created ? <TableCell className={cellClass}>{ticket.createdAt}</TableCell> : null}
                      {visibleColumns.status ? <TableCell className={cellClass}><Badge className={`${ticketStatusBadgeClass[ticket.status]} ${badgeClass}`}>{statusLabel[ticket.status]}</Badge></TableCell> : null}
                      {visibleColumns.priority ? <TableCell className={cellClass}><Badge className={`${ticketPriorityBadgeClass[ticket.priority]} ${badgeClass}`}>{priorityLabel[ticket.priority]}</Badge></TableCell> : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(ticket)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(ticket)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTicketStatus(ticket, "in-progress")}>Set In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTicketStatus(ticket, "resolved")}>Set Resolved</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteCandidate(ticket)} className="text-rose-600 focus:text-rose-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredTickets.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
