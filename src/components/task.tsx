import { useTaskContext } from '@/context/TaskContext';
import { cn } from '@/lib/utils';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { TableBody, TableCell, TableRow } from './ui/table';

interface TasksProps {
  id: string;
  userId: string;
  task: string;
  status: 'pending' | 'completed';
  className?: string;
}

export const Task = ({ id, userId, task, status }: TasksProps) => {
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
    toggleStatus.mutate({ id, status });
  };

  const handleDelete = () => {
    deleteTask.mutate({ id });
  };

  return (
    <TableBody
      // className={cn(
      //   'flex gap-2 justify-between items-center task-item py-2.5',
      //   className,
      // )}
      // style={{ viewTransitionName: `task-${id}` }}
    >
      <TableRow className='flex gap-2 items-center justify-start'>
        <TableCell>
        <Checkbox
          id={`task-${id}`}
          checked={status === 'completed'}
          onCheckedChange={handleToggle}
        />
        </TableCell>
        <TableCell>
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
        </TableCell>

        <TableCell>
      <ButtonGroup>
        <Button size='icon' onClick={() => setIsEditing(id)}>
          <Edit3 />
        </Button>
        <Button size='icon' variant='destructive' onClick={handleDelete}>
          <Trash2 />
        </Button>
      </ButtonGroup>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
