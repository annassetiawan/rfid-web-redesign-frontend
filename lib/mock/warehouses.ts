import type { Warehouse } from "@/lib/types/warehouse";

const countries = ["Indonesia", "Singapore", "Japan", "South Korea", "Taiwan"];
const statesByCountry: Record<string, string[]> = {
  Indonesia: ["DKI Jakarta", "West Java", "East Java"],
  Singapore: ["Central Region", "East Region", "West Region"],
  Japan: ["Tokyo", "Osaka", "Aichi"],
  "South Korea": ["Seoul", "Gyeonggi-do", "Busan"],
  Taiwan: ["Taipei", "Taichung", "Kaohsiung"]
};

const citiesByState: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta"],
  "West Java": ["Bandung", "Bekasi"],
  "East Java": ["Surabaya", "Malang"],
  "Central Region": ["Singapore"],
  "East Region": ["Pasir Ris"],
  "West Region": ["Jurong East"],
  Tokyo: ["Chiyoda", "Shinjuku"],
  Osaka: ["Kita", "Naniwa"],
  Aichi: ["Nagoya"],
  Seoul: ["Jongno-gu", "Gangnam-gu"],
  "Gyeonggi-do": ["Suwon", "Bucheon"],
  Busan: ["Haeundae-gu"],
  Taipei: ["Xinyi", "Da'an"],
  Taichung: ["Xitun"],
  Kaohsiung: ["Sanmin"]
};

const dateOf = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  return `2026-01-${day}`;
};

export const warehouses: Warehouse[] = Array.from({ length: 32 }).map((_, index) => {
  const country = countries[index % countries.length];
  const statePool = statesByCountry[country];
  const state = statePool[index % statePool.length];
  const cityPool = citiesByState[state];
  const city = cityPool[index % cityPool.length];
  const serial = (index + 1).toString().padStart(3, "0");
  const code = `${country.slice(0, 2).toUpperCase()}${(index % 7) + 1}${city.slice(0, 2).toUpperCase()}`;
  const createdAt = dateOf(index + 3);
  const updatedAt = dateOf(index + 12);

  return {
    id: `WH-${serial}`,
    name: `${city} Hub ${String((index % 4) + 1).padStart(2, "0")}`,
    code,
    address: `${10 + index} Logistics Avenue, ${city}, ${state}, ${country}`,
    country,
    state,
    city,
    zipCode: `${10000 + (index * 37) % 89999}`,
    status: index % 6 === 0 ? "inactive" : "active",
    createdAt,
    updatedAt
  };
});
