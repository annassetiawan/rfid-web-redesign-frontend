export type TicketType = "bug" | "request" | "question";
export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCommentVisibility = "internal" | "public";

export type TicketComment = {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  visibility: TicketCommentVisibility;
};

export type Ticket = {
  id: string;
  subject: string;
  requestorName: string;
  requestorEmail: string;
  type: TicketType;
  category: string;
  subcategory: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
};
