export type TaskStatus = 'pending' | 'completed';

/**
 * Shape returned by the tRPC server (`getTasks`) and stored in the React Query cache.
 * Drizzle serializes `timestamp` columns to ISO strings over the wire.
 */
export type ServerTask = {
  id: string;
  userId: string;
  task: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

/**
 * Same as ServerTask plus an optional `pending` flag used by the optimistic reducer
 * to mark rows that are awaiting server confirmation (shimmer).
 */
export type Task = ServerTask & {
  pending?: boolean;
};

/**
 * Convenience type for the `getTasks` query data.
 */
export type TasksList = Task[];

/**
 * Union of all actions that can be dispatched to the optimistic task reducer.
 */
export type OptimisticTaskAction =
  | { type: 'create'; payload: Task }
  | { type: 'edit'; payload: { id: string; task: string } }
  | { type: 'update'; payload: { id: string; status: TaskStatus } }
  | { type: 'delete'; payload: { id: string } };
