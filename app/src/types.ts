export type Subject = string;

export type Task = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional)
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  workload?: number;
  link?: string;
  subject?: Subject;
  createdAt: number;
  completedAt?: number;
};
export type NewTask = Omit<Task, 'id' | 'createdAt'>;

export type Quote = {
  id: string;
  text: string;
  author: string;
  pinnedAt: number;
};

export type NewQuote = Omit<Quote, 'id' | 'pinnedAt'>;


