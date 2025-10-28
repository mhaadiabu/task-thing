export interface TaskTypes {
  id: string;
  task: string;
  status: "pending" | "completed";
  createdAt: number;
  updatedAt: number;
}

export interface ActionTypes {
  type: "create-task" | "update-task" | "edit-task" | "delete-task";
  payload: {
    id?: string;
    task?: string;
    status?: "pending" | "completed";
  };
}

export const ACTIONS = {
  CREATE_TASK: "create-task",
  UPDATE_TASK: "update-task",
  EDIT_TASK: "edit-task",
  DELETE_TASK: "delete-task",
} as const;

const newTodo = (task: string) => {
  const entry: TaskTypes = {
    id: crypto.randomUUID(),
    task: task,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return entry;
};

const reducer = (tasks: TaskTypes[], action: ActionTypes): TaskTypes[] => {
  switch (action.type) {
    case ACTIONS.CREATE_TASK:
      if (action.payload.task === undefined || action.payload.task.length < 1)
        return tasks;
      return [...tasks, newTodo(action.payload.task)];
    case ACTIONS.UPDATE_TASK:
      return tasks.map((task) => {
        if (task.id === action.payload.id) {
          return {
            ...task,
            status: task.status === "pending" ? "completed" : "pending",
            updatedAt: Date.now(),
          };
        }
        return task;
      });
    case ACTIONS.EDIT_TASK:
      return tasks.map((task) => {
        if (task.id === action.payload.id) {
          return {
            ...task,
            ...(action.payload.task !== undefined && {
              task: action.payload.task,
            }),
            updatedAt: Date.now(),
          };
        }
        return task;
      });
    case ACTIONS.DELETE_TASK:
      return tasks.filter((task) => task?.id !== action.payload.id);
    default:
      return tasks;
  }
};

export default reducer;
