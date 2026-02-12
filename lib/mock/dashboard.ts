import {
  ChartSpline,
  ClipboardList,
  Clock3,
  GitPullRequest,
  Mail,
  Package,
  PackageCheck,
  ScanLine,
  Search,
  Server,
  Truck,
  User,
  Users,
  Warehouse,
  CircleHelp,
  LayoutGrid,
  type LucideIcon
} from "lucide-react";

import type {
  DateRangeOption,
  KpiCard,
  LabelCard,
  NavGroup,
  RequestSummaryBlock,
  TrendSeries
} from "@/lib/types";

export const navGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      {
        label: "Request",
        href: "/requests/local",
        icon: GitPullRequest
      },
      {
        label: "Unit",
        href: "#",
        icon: Server,
        expanded: true,
        hasChevron: true,
        children: [
          { label: "Inventory", href: "/inventory" },
          { label: "Master Data", href: "#" },
          { label: "Unit Relation", href: "#" }
        ]
      },
      { label: "Search", href: "#", icon: Search },
      { label: "Cycle Count", href: "#", icon: Package },
      { label: "Customer", href: "#", icon: Users },
      { label: "Warehouse", href: "#", icon: Warehouse },
      { label: "Scanner", href: "#", icon: ScanLine },
      { label: "Logistic Email", href: "#", icon: Mail },
      { label: "User", href: "#", icon: User },
      { label: "Support Center", href: "#", icon: CircleHelp }
    ]
  }
];

export const dateRangeOptions: DateRangeOption[] = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "This quarter"
];

type KpiSeed = Omit<KpiCard, "icon"> & { icon: LucideIcon };

export const kpiCards: KpiSeed[] = [
  {
    title: "Total Requests",
    value: "12,840",
    description: "Combined delivery and pickup requests across all hubs.",
    icon: ClipboardList
  },
  {
    title: "Pending Requests",
    value: "1,248",
    description: "Awaiting review, assignment, or warehouse confirmation.",
    icon: Clock3
  },
  {
    title: "Inbound Pending",
    value: "472",
    description: "Expected arrivals pending scan and receiving workflow.",
    icon: PackageCheck
  },
  {
    title: "Tagged Rate",
    value: "93.6%",
    description: "Share of units with active RFID tags in current period.",
    icon: ChartSpline
  },
  {
    title: "In Transit Units",
    value: "2,186",
    description: "Assets currently moving between warehouse and destination.",
    icon: Truck
  }
];

export const requestSummary: RequestSummaryBlock[] = [
  {
    title: "Delivery",
    items: [
      { label: "Draft", value: 82, tone: "slate" },
      { label: "In Progress", value: 241, tone: "blue" },
      { label: "Completed", value: 1180, tone: "green" },
      { label: "Missing Mandatory Accessory", value: 36, tone: "amber" }
    ]
  },
  {
    title: "Pickup",
    items: [
      { label: "Draft", value: 64, tone: "slate" },
      { label: "In Progress", value: 201, tone: "blue" },
      { label: "Completed", value: 934, tone: "green" },
      { label: "Missing Mandatory Accessory", value: 19, tone: "amber" }
    ]
  }
];

export const labelCards: LabelCard[] = [
  {
    title: "Warehouse Label Total",
    total: 50200,
    tagged: 47380,
    untagged: 2820
  },
  {
    title: "Pearl Paper Label",
    total: 28800,
    tagged: 25920,
    untagged: 2880
  },
  {
    title: "Anti Metal Label",
    total: 21400,
    tagged: 20544,
    untagged: 856
  }
];

export const trends: TrendSeries[] = [
  {
    title: "Delivery Trend",
    points: [
      { day: "Mon", value: 120 },
      { day: "Tue", value: 148 },
      { day: "Wed", value: 136 },
      { day: "Thu", value: 164 },
      { day: "Fri", value: 172 },
      { day: "Sat", value: 139 },
      { day: "Sun", value: 126 }
    ]
  },
  {
    title: "Pickup Trend",
    points: [
      { day: "Mon", value: 102 },
      { day: "Tue", value: 118 },
      { day: "Wed", value: 110 },
      { day: "Thu", value: 127 },
      { day: "Fri", value: 131 },
      { day: "Sat", value: 120 },
      { day: "Sun", value: 108 }
    ]
  }
];
