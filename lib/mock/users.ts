import type { User, UserRole } from "@/lib/types/user";

const names = [
  "Demo User",
  "Admin Tes",
  "WJAPAC Tester",
  "JAPAC Team",
  "Kai",
  "Linda",
  "Miftha Saristika",
  "Farhan Setiawan",
  "Dina Salsabila",
  "Kamal"
];

const roles: UserRole[] = ["admin", "admin-eval", "warehouse-operator"];

const warehouseLocations = [
  "",
  "c/o PT.Tiga-Tiga Nusantara (WJKT1)",
  "JAPAC Test warehouse",
  "warehouse - WNRT1",
  "warehouse - WSSY1",
  "warehouse - WSEL1",
  "office - Jakarta"
];

const domains = ["mail.com", "gmail.com", "paloaltonetworks.com", "logisticshub.co"];

const dateOf = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  return `2026-02-${day}`;
};

export const users: User[] = Array.from({ length: 44 }).map((_, index) => {
  const name = `${names[index % names.length]}${index % 3 === 0 ? "" : ` ${index}`}`;
  const role = roles[index % roles.length];
  const local = name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
  const email = `${local}@${domains[index % domains.length]}`;
  const warehouseLocation =
    role === "warehouse-operator"
      ? warehouseLocations[(index % (warehouseLocations.length - 1)) + 1]
      : warehouseLocations[index % 2];
  const createdAt = dateOf(index + 2);
  const updatedAt = dateOf(index + 11);
  const status = index % 7 === 0 ? "inactive" : "active";

  return {
    id: `USR-${String(index + 1).padStart(3, "0")}`,
    name,
    email,
    role,
    warehouseLocation,
    status,
    lastLoginAt: status === "active" ? `${dateOf(index + 15)} 08:${String((index * 7) % 60).padStart(2, "0")}` : undefined,
    createdAt,
    updatedAt
  };
});
