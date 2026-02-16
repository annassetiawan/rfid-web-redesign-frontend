import type { Customer } from "@/lib/types/customer";

const companyPool = [
  "Taiwan Semiconductor Manufacturing Company Limited",
  "Bae, Kim & Lee LLC",
  "NHN Corporation",
  "Sakura Living",
  "Arjuna Tech",
  "Kirana Retail",
  "Sinar Abadi",
  "Omega Elektrik",
  "Atlas Fashion",
  "Nusa Farma"
];

const countryPool = ["Taiwan", "South Korea", "Indonesia", "Singapore", "Japan"];

const cityAddressMap: Record<string, string[]> = {
  Taiwan: ["8, Li-Hsin Rd. 6, Hsinchu Science Park", "No. 77, Dunhua S. Rd, Taipei"],
  "South Korea": ["Centropolis B, Jongno-gu, Seoul", "7th FL, Naver Green Factory, Gyeonggi-do"],
  Indonesia: ["Jl. Jend. Sudirman No.52, Jakarta", "Jl. Asia Afrika No.8, Bandung"],
  Singapore: ["10 Anson Rd, International Plaza", "20 Pasir Panjang Rd, Mapletree"],
  Japan: ["1-2-3 Marunouchi, Chiyoda-ku, Tokyo", "4-5-6 Umeda, Kita-ku, Osaka"]
};

const contactPool = [
  "Kevin Panghsiang Hsi",
  "Jeong Tae Yang",
  "Hyo Kim",
  "Ayu Pratama",
  "Rizal Mahendra",
  "Nadia Putri",
  "Farhan Setiawan",
  "Kamal Husein",
  "Dina Salsabila",
  "Mika Tanaka"
];

const toDate = (seed: number) => {
  const day = ((seed % 27) + 1).toString().padStart(2, "0");
  return `2026-02-${day}`;
};

export const customers: Customer[] = Array.from({ length: 42 }).map((_, index) => {
  const country = countryPool[index % countryPool.length];
  const company = companyPool[index % companyPool.length];
  const contactName = contactPool[index % contactPool.length];
  const addressPool = cityAddressMap[country];
  const address = addressPool[index % addressPool.length];
  const serial = (index + 1).toString().padStart(3, "0");
  const domain = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
  const createdAt = toDate(index + 3);
  const updatedAt = toDate(index + 9);

  return {
    id: `CUS-${serial}`,
    companyName: company,
    address,
    zipCode: `${30000 + (index % 800)}`,
    country,
    contactName,
    contactPhone: `+${80 + (index % 5)}-${100000000 + index}`,
    contactEmail: `${contactName.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".").replace(/^\./, "").replace(/\.$/, "")}@${domain || "customer"}.com`,
    status: index % 6 === 0 ? "inactive" : "active",
    createdAt,
    updatedAt
  };
});
