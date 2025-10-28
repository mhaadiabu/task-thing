import { createContext, type SetStateAction } from "react";
import type { TaskTypes, ActionTypes } from "../lib/utils/reducer";

interface TaskContextType {
  tasks: TaskTypes[];
  dispatch: React.Dispatch<ActionTypes>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<SetStateAction<boolean>>;
}

export const TaskContext = createContext<TaskContextType | null>(null);
