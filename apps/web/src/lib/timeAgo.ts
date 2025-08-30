// Simple "time ago" helper for server components
export function timeAgo(date: Date | number) {
    const d = typeof date === "number" ? new Date(date) : date;
    const diff = (Date.now() - d.getTime()) / 1000;
    const units: [number, string][] = [
      [60, "seconds"],
      [60, "minutes"],
      [24, "hours"],
      [7, "days"],
      [4.345, "weeks"],
      [12, "months"],
    ];
    let i = 0, val = diff;
    for (; i < units.length && val >= units[i][0]; i++) val /= units[i][0];
    const unit = i === 0 ? "seconds" : units[i - 1][1];
    const amount = Math.floor(val);
    return `${amount} ${unit} ago`;
  }
  