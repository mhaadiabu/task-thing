import { useTaskContext } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import { ViewTransition, withViewTransition } from '@/utils/view-transitions';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface TasksProps {
  id: string;
  userId: string;
  task: string;
  status: 'pending' | 'completed';
  className?: string;
}

const Tasks = ({ id, userId, task, status, className }: TasksProps) => {
  const { setIsEditing } = useTaskContext();

  const toggleStatus = useMutation(
    trpc.updateTask.mutationOptions({
      onMutate: async (vars) => {
        await queryClient.cancelQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });

        const previous = queryClient.getQueryData<Task[]>(
          trpc.getTasks.queryKey({ userId }),
        );

        const nextStatus = vars.status === 'pending' ? 'completed' : 'pending';

        // Optimistically update the cache (so the checkbox/label update immediately).
        withViewTransition(() => {
          queryClient.setQueryData<Task[] | undefined>(
            trpc.getTasks.queryKey({ userId }),
            (current) => {
              if (!current) return current;
              return current.map((t: Task) =>
                t.id === vars.id ? { ...t, status: nextStatus } : t,
              );
            },
          );
        });

        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData<Task[] | undefined>(
            trpc.getTasks.queryKey({ userId }),
            ctx.previous,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const deleteTask = useMutation(
    trpc.deleteTask.mutationOptions({
      onMutate: async (vars) => {
        await queryClient.cancelQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });

        const previous = queryClient.getQueryData<Task[]>(
          trpc.getTasks.queryKey({ userId }),
        );

        // Optimistically remove the task from the cache so it disappears instantly.
        queryClient.setQueryData<Task[] | undefined>(
          trpc.getTasks.queryKey({ userId }),
          (current) => {
            if (!current) return current;
            return current.filter((t: Task) => t.id !== vars.id);
          },
        );

        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData<Task[] | undefined>(
            trpc.getTasks.queryKey({ userId }),
            ctx.previous,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  return (
    <ViewTransition
      name={`task-${id}`}
      className={cn(
        status === 'completed' ? 'task-completed' : 'task-pending',
      )}
    >
      <div className={cn('flex gap-2 justify-between items-center', className)}>
        <div className='flex gap-2 items-center justify-start'>
          <Checkbox
            id={`task-${id}`}
            checked={status === 'completed'}
            onCheckedChange={() => toggleStatus.mutate({ id, status })}
          />
          <Label
            htmlFor={`task-${id}`}
            className={cn(
              status === 'completed'
                ? 'line-through text-muted-foreground'
                : 'no-underline',
              'word-wrap',
            )}
          >
            {task}
          </Label>
        </div>

        <ButtonGroup>
          <Button size='icon' onClick={() => setIsEditing(id)}>
            <Edit3 />
          </Button>
          <Button
            size='icon'
            variant='destructive'
            onClick={() => deleteTask.mutate({ id })}
          >
            <Trash2 />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};

export default Tasks;
