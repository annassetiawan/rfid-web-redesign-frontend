type LineChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  points: LineChartPoint[];
  strokeClassName?: string;
  fillClassName?: string;
};

function normalizePoints(points: LineChartPoint[]) {
  const max = Math.max(...points.map((point) => point.value), 0);
  const min = Math.min(...points.map((point) => point.value), 0);
  const range = max - min || 1;
  return points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 100;
    const y = 100 - ((point.value - min) / range) * 100;
    return { ...point, x, y };
  });
}

export function LineChart({ points, strokeClassName, fillClassName }: LineChartProps) {
  const normalized = normalizePoints(points);
  const path = normalized
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${path} L 100 100 L 0 100 Z`;

  return (
    <div className="relative h-40 w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d={areaPath} className={fillClassName ?? "fill-indigo-100/60"} />
        <path
          d={path}
          className={strokeClassName ?? "stroke-indigo-600"}
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {normalized.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="2" className="fill-indigo-600" />
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-7 text-center text-xs text-slate-400">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}
