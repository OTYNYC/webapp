export function getMonthGridDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month - 1, 1 - startWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const zeroIndexed = month - 1 + delta;
  const nextYear = year + Math.floor(zeroIndexed / 12);
  const nextMonth = ((zeroIndexed % 12) + 12) % 12;

  return { year: nextYear, month: nextMonth + 1 };
}
