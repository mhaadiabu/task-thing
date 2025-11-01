import { createContext, type SetStateAction } from "react";
import type { TaskTypes, ActionTypes } from "../lib/utils/reducer";

interface TaskContextType {
  tasks: TaskTypes[];
  dispatch: React.Dispatch<ActionTypes>;
  isEditing: string | null;
  setIsEditing: React.Dispatch<SetStateAction<string | null>>;
}

export const TaskContext = createContext<TaskContextType | null>(null);
