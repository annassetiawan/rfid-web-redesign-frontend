import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const parentRequests = [
  { id: "REQ-2026-003", label: "REQ-2026-003 · Omega Elektrik · Delivery" },
  { id: "REQ-2026-010", label: "REQ-2026-010 · Roda Utama · Delivery" },
  { id: "REQ-2026-015", label: "REQ-2026-015 · Sentosa Steel · Delivery" }
];

export default function AdditionalDeliveryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Additional Delivery Request</h1>
        <p className="text-sm text-slate-500">
          Ship additional accessories for an existing processed delivery.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Select Parent Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type to search for a processed delivery request..." />
              </SelectTrigger>
              <SelectContent>
                {parentRequests.map((request) => (
                  <SelectItem key={request.id} value={request.id}>
                    {request.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Search by request number or customer name..." />
          </div>
          <Separator />
          <p className="text-xs text-slate-500">
            Only processed delivery requests are shown. Type to search by request number or customer name.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
