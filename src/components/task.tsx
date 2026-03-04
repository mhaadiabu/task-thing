import { useMutation } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { startTransition, ViewTransition } from 'react';
import { toast } from 'sonner';

import { useTaskContext } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { queryClient, api } from '@/utils/trpc';

import type { OptimisticTaskAction } from '../types/task';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

type TaskRow = {
  userId: string;
  task: string;
  id: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
};
type TasksData = TaskRow[] | undefined;

export const Task = ({
  cancelTaskCreate,
  id,
  mutateOptimisticTask,
  status,
  task,
  userId,
}: {
  cancelTaskCreate: () => void;
  className?: string;
  id: string;
  mutateOptimisticTask: (action: OptimisticTaskAction) => void;
  status: 'pending' | 'completed';
  task: string;
  userId: string;
}) => {
  const { setIsEditing } = useTaskContext();
  const queryKey = api.getTasks.queryKey({ userId });

  const toggleStatus = useMutation(
    api.updateTask.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success('Task updated!');
      },
    }),
  );

  const deleteTask = useMutation(
    api.deleteTask.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: TasksData) => old?.filter((t) => t.id !== id));
        return { previous };
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success('Task deleted!');
      },
    }),
  );

  const handleToggle = () => {
    startTransition(() => {
      const newStatus = status === 'pending' ? 'completed' : 'pending';
      mutateOptimisticTask({ type: 'update', payload: { id, status: newStatus } });
      toggleStatus.mutate({ id, status: newStatus });
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      mutateOptimisticTask({ type: 'delete', payload: { id } });
      deleteTask.mutate({ id });
    });
  };

  const handleEdit = () => {
    startTransition(() => {
      setIsEditing(id);
      cancelTaskCreate();
    });
  };

  return (
    <ViewTransition enter='slide-up' exit='scale-down'>
      <div className='flex w-full items-center justify-between gap-2 py-2'>
        <div className='flex items-start gap-2'>
          <Checkbox
            id={`task-${id}`}
            checked={status === 'completed'}
            onCheckedChange={handleToggle}
          />
          <Label
            htmlFor={`task-${id}`}
            className={cn(
              status === 'completed' ? 'text-muted-foreground line-through' : 'no-underline',
              'word-wrap whitespace-pre-wrap',
            )}
          >
            {task}
          </Label>
        </div>

        <ButtonGroup>
          <Button size='icon' onClick={handleEdit}>
            <Edit3 />
          </Button>
          <Button size='icon' variant='destructive' onClick={handleDelete}>
            <Trash2 />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
