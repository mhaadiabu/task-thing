import { useReducer, useState } from "react";
import { reducer, type TaskTypes } from "@/lib/utils";
import { TaskContext } from "@/context/TaskContext";

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, dispatch] = useReducer(reducer, [] as TaskTypes[]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <TaskContext.Provider value={{ tasks, dispatch, isEditing, setIsEditing }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
