"use client";

import * as React from "react";

export type DensityMode = "compact" | "comfortable";

type DensityClasses = {
  rowClass: string;
  cellClass: string;
  badgeClass: string;
  actionBtnClass: string;
};

const densityClassMap: Record<DensityMode, DensityClasses> = {
  compact: {
    rowClass: "h-9",
    cellClass: "px-2 py-1 text-xs",
    badgeClass: "h-5 px-2 text-[11px]",
    actionBtnClass: "h-8 w-8"
  },
  comfortable: {
    rowClass: "h-11",
    cellClass: "px-3 py-2 text-sm",
    badgeClass: "h-6 px-2.5 text-xs",
    actionBtnClass: "h-9 w-9"
  }
};

export function useDensity(initial: DensityMode = "comfortable") {
  const [density, setDensity] = React.useState<DensityMode>(initial);
  const classes = densityClassMap[density];

  return {
    density,
    setDensity,
    ...classes
  };
}

export function getDensityClasses(density: DensityMode) {
  return densityClassMap[density];
}
