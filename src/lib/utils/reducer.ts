export interface TaskTypes {
  id: string;
  task: string;
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
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
} satisfies Record<string, ActionTypes["type"]>;

const newTodo = (task: string) => {
  const entry: TaskTypes = {
    id: crypto.randomUUID(),
    task: task,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return entry;
};

const reducer = (tasks: TaskTypes[], action: ActionTypes): TaskTypes[] => {
  const now = new Date().toISOString();

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
            updatedAt: now,
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
            updatedAt: now,
          };
        }
        return task;
      });
    case ACTIONS.DELETE_TASK:
      return tasks.filter((task) => task.id !== action.payload.id);
    default:
      return tasks;
  }
};

export default reducer;
