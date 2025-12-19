import { createContext, useContext, type SetStateAction } from 'react';

interface TaskContextType {
  isEditing: string | null;
  setIsEditing: React.Dispatch<SetStateAction<string | null>>;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined,
);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};
