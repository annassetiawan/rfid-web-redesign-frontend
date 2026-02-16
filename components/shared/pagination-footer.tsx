"use client";

import * as React from "react";

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export type PaginationFooterProps = {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function PaginationFooter({
  pageSize,
  pageIndex,
  totalCount,
  onPageChange,
  onPageSizeChange
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);

  React.useEffect(() => {
    if (pageIndex !== clampedPageIndex) {
      onPageChange(clampedPageIndex);
    }
  }, [pageIndex, clampedPageIndex, onPageChange]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          className="h-8 rounded-md border border-border/60 bg-background px-2 text-sm text-foreground"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={clampedPageIndex === 1}
              onClick={() => onPageChange(Math.max(1, clampedPageIndex - 1))}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>{clampedPageIndex}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              disabled={clampedPageIndex === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, clampedPageIndex + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
