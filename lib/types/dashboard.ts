import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: Array<{
    label: string;
    href: string;
  }>;
  expanded?: boolean;
  hasChevron?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export type DateRangeOption = "Today" | "Last 7 days" | "Last 30 days" | "This quarter";

export type KpiCard = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type RequestStatusItem = {
  label: string;
  value: number;
  tone: "slate" | "blue" | "green" | "amber";
};

export type RequestSummaryBlock = {
  title: "Delivery" | "Pickup";
  items: RequestStatusItem[];
};

export type LabelCard = {
  title: string;
  total: number;
  tagged: number;
  untagged: number;
};

export type TrendPoint = {
  day: string;
  value: number;
};

export type TrendSeries = {
  title: string;
  points: TrendPoint[];
};
