import { useState } from 'react';
import { TaskContext } from '@/context/TaskContext';

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);

  return (
    <TaskContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
