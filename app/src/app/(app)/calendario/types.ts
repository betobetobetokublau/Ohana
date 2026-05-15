export type CalendarEvent = {
  id: string;
  type: string;
  label: string;
  date: string; // yyyy-MM-dd
  color: string;
  completed?: boolean;
};
