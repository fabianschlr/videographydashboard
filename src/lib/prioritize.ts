import { Shift, Task } from "./types";

const minutes = (value: string) => {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
};

const localDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export function availableMinutesToday(shifts: Shift[], now = new Date()) {
  const date = localDate(now);
  const todays = shifts.filter((shift) => shift.date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const current = now.getHours() * 60 + now.getMinutes();
  const endOfDay = 22 * 60;
  if (!todays.length) return Math.max(0, endOfDay - current);
  let free = 0;
  let cursor = Math.max(current, 7 * 60);
  for (const shift of todays) {
    const start = minutes(shift.start_time);
    const end = minutes(shift.end_time);
    if (end <= cursor) continue;
    if (start > cursor) free += start - cursor;
    cursor = Math.max(cursor, end);
  }
  return free + Math.max(0, endOfDay - cursor);
}

export function rankedTasks(tasks: Task[], shifts: Shift[], now = new Date()) {
  const available = availableMinutesToday(shifts, now);
  return tasks
    .filter((task) => task.status === "open" || task.status === "in_progress")
    .filter((task) => task.estimated_minutes <= available)
    .map((task) => {
      const priority = { A: 3, B: 2, C: 1 }[task.priority_tier];
      const days = task.deadline
        ? Math.ceil((new Date(task.deadline).getTime() - now.getTime()) / 86_400_000)
        : undefined;
      const urgency = days === undefined ? 1 : Math.max(1, 14 - Math.max(0, days));
      return { ...task, score: priority * urgency };
    })
    .sort((a, b) => b.score - a.score || a.estimated_minutes - b.estimated_minutes);
}
