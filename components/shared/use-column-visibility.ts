"use client";

import * as React from "react";

type ColumnState = Record<string, boolean>;

type ColumnVisibilityHook<T extends ColumnState> = {
  columns: T;
  setColumns: React.Dispatch<React.SetStateAction<T>>;
};

export function useColumnVisibility<T extends ColumnState>(key: string, defaults: T): ColumnVisibilityHook<T> {
  const [columns, setColumns] = React.useState<T>(defaults);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<T>;
        setColumns((current) => ({ ...current, ...parsed }));
      }
    } catch {
      // ignore storage errors
    }
  }, [key]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(columns));
    } catch {
      // ignore storage errors
    }
  }, [key, columns]);

  return { columns, setColumns };
}
