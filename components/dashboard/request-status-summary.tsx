"use client";

import * as React from "react";
import { MoreHorizontal, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requestSummary } from "@/lib/mock";

export function RequestStatusSummary() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const rows = React.useMemo(
    () =>
      requestSummary.flatMap((block) =>
        block.items.map((item) => ({
          type: block.title,
          label: item.label,
          value: item.value,
          tone: item.tone
        }))
      ),
    []
  );

  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return row.label.toLowerCase().includes(query) || row.type.toLowerCase().includes(query);
  });

  return (
    <section className="space-y-4">
      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Request Status Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Delivery and pickup progress at a glance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-9">
              Customize Columns
            </Button>
            <Button className="h-9">Add Section</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Input
                className="h-9"
                placeholder="Search status, type..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Button variant="outline" className="h-9">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <p className="text-xs text-muted-foreground">{filteredRows.length} results</p>
          </div>

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur">
                <TableRow className="h-11">
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={`${row.type}-${row.label}`} className="h-11 hover:bg-muted/40">
                    <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                    <TableCell>
                      <Badge variant={row.tone} className="text-[11px] uppercase tracking-wide">
                        {row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{row.value}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Export</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
