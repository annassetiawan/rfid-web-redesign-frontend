import type { Ticket, TicketComment, TicketPriority, TicketStatus, TicketType } from "@/lib/types/ticket";

const categories = ["Request", "Inventory", "Scanner", "Master Data", "Support Center"];
const subcategories = ["RFID Tag Missing", "Scanner Offline", "Warehouse Mapping", "Permission Update", "Data Sync"];
const subjects = [
  "Scanner cannot connect to warehouse network",
  "Request approval email not received",
  "Inventory status mismatch after transfer",
  "Need access update for new operator",
  "Master unit relation is not visible"
];
const requestors = [
  { name: "Kai", email: "kai@mail.com" },
  { name: "Linda", email: "linda@gmail.com" },
  { name: "Farhan Setiawan", email: "farhan@paloaltonetworks.com" },
  { name: "Dina Salsabila", email: "dina@logisticshub.co" },
  { name: "Kamal", email: "kamal@mail.com" }
];

const statuses: TicketStatus[] = ["open", "in-progress", "resolved", "closed"];
const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
const types: TicketType[] = ["bug", "request", "question"];

const dateOf = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  const hour = String((seed * 3) % 24).padStart(2, "0");
  const minute = String((seed * 7) % 60).padStart(2, "0");
  return `2026-02-${day} ${hour}:${minute}`;
};

const commentOf = (ticketId: string, seed: number): TicketComment => ({
  id: `${ticketId}-C${seed}`,
  author: seed % 2 === 0 ? "Support Agent" : "Requestor",
  message:
    seed % 2 === 0
      ? "Issue acknowledged and currently under investigation."
      : "Please update once this has been resolved for operations.",
  createdAt: dateOf(seed + 30),
  visibility: seed % 3 === 0 ? "internal" : "public"
});

export const tickets: Ticket[] = Array.from({ length: 42 }).map((_, index) => {
  const id = `TCK-2026-${String(index + 1).padStart(4, "0")}`;
  const requestor = requestors[index % requestors.length];
  const status = statuses[index % statuses.length];
  const type = types[index % types.length];
  const priority = priorities[index % priorities.length];
  const category = categories[index % categories.length];
  const subcategory = subcategories[index % subcategories.length];
  const subject = subjects[index % subjects.length];

  return {
    id,
    subject,
    requestorName: requestor.name,
    requestorEmail: requestor.email,
    type,
    category,
    subcategory,
    description: `${subject}. Ticket generated from operational support channel for ${category.toLowerCase()} monitoring.`,
    status,
    priority,
    assignee: index % 4 === 0 ? undefined : `Agent ${(index % 6) + 1}`,
    createdAt: dateOf(index + 3),
    updatedAt: dateOf(index + 13),
    comments: [commentOf(id, index + 1), commentOf(id, index + 2)]
  };
});
