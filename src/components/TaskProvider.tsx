import { useReducer, useState } from "react";
import { reducer } from "@/lib/utils";
import { TaskContext } from "@/context/TaskContext";

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, dispatch] = useReducer(reducer, []);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  return (
    <TaskContext.Provider value={{ tasks, dispatch, isEditing, setIsEditing }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
