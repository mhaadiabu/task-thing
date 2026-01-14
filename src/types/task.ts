export type TaskStatus = 'pending' | 'completed';

/**
 * Shared Task shape used on the client for optimistic updates.
 *
 * Notes:
 * - The server returns task rows from Drizzle/Postgres; timestamps may arrive as
 *   strings depending on serialization. For optimistic entries we typically use Date.
 * - Keep `createdAt/updatedAt` broad enough to accommodate both.
 */
export type Task = {
  id: string;
  userId: string;
  task: string;
  status: TaskStatus;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

/**
 * Convenience type for the `getTasks` query data.
 */
export type TasksList = Task[];
