export type Priority = "A" | "B" | "C";
export type SessionReason = "handy" | "youtube" | "gruebeln" | "perfektionismus" | "muedigkeit" | "unterbrochen" | "keine_ahnung";
export type Task = { id: string; title: string; priority_tier: Priority; deadline: string | null; estimated_minutes: number; status: string };
export type Shift = { date: string; start_time: string; end_time: string };

export const failReasons: { id: SessionReason; label: string }[] = [
  { id: "handy", label: "Handy" }, { id: "youtube", label: "YouTube" },
  { id: "gruebeln", label: "Grübeln" }, { id: "perfektionismus", label: "Perfektionismus" },
  { id: "muedigkeit", label: "Müdigkeit" }, { id: "unterbrochen", label: "Unterbrochen" },
  { id: "keine_ahnung", label: "Keine Ahnung" },
];
