import { useTaskContext } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { startTransition, ViewTransition } from 'react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

export const Task = ({
  id,
  userId,
  task,
  status,
}: {
  id: string;
  userId: string;
  task: string;
  status: 'pending' | 'completed';
  className?: string;
}) => {
  const { setIsEditing } = useTaskContext();

  const toggleStatus = useMutation(
    trpc.updateTask.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const deleteTask = useMutation(
    trpc.deleteTask.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const handleToggle = () => {
    startTransition(() => {
      toggleStatus.mutate({ id, status });
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteTask.mutate({ id });
    });
  };

  const handleEdit = () => {
    startTransition(() => setIsEditing(id));
  };

  return (
    <ViewTransition enter='slide-up' exit='scale-down'>
      <div className='flex gap-2 items-center justify-between w-full py-2'>
        <div className='flex gap-2 items-start'>
          <Checkbox
            id={`task-${id}`}
            checked={status === 'completed'}
            onCheckedChange={handleToggle}
          />
          <Label
            htmlFor={`task-${id}`}
            className={cn(
              status === 'completed'
                ? 'line-through text-muted-foreground'
                : 'no-underline',
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
