import { useTaskContext } from '@/context/TaskContext';
import type { Task } from '@/types/task';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Input } from './ui/input';

interface EditTaskProps {
  id: string;
  userId: string;
  task: string;
}

const EditTask = ({ id, userId, task }: EditTaskProps) => {
  const { setIsEditing } = useTaskContext();

  const [editedTask, setEditedTask] = useState(task);

  const edit = useMutation(
    trpc.editTask.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });

        const previousTasks = queryClient.getQueryData<Task[]>(
          trpc.getTasks.queryKey({ userId }),
        );

        // Optimistically update task text in cache
        queryClient.setQueryData<Task[] | undefined>(
          trpc.getTasks.queryKey({ userId }),
          (old) => {
            if (!old) return old;
            return old.map((t) =>
              t.id === variables.id ? { ...t, task: variables.task } : t,
            );
          },
        );

        return { previousTasks };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData<Task[] | undefined>(
            trpc.getTasks.queryKey({ userId }),
            context.previousTasks,
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

  const editTask = () => {
    const next = editedTask.trim();
    if (!next) return;

    edit.mutate({ id, task: next });
    setIsEditing(null);
  };

  return (
    <div className='flex gap-2 justify-between items-center w-full mx-auto'>
      <div className='flex gap-2 items-center justify-start w-full'>
        <Input
          type='text'
          name='edit-task'
          value={editedTask}
          onChange={(e) => setEditedTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              editTask();
            } else if (e.key === 'Escape') {
              setIsEditing(null);
            }
          }}
          autoFocus
        />
      </div>

      <ButtonGroup>
        <Button
          variant='destructive'
          size='icon'
          onClick={() => setIsEditing(null)}
        >
          <X />
        </Button>
        <Button size='icon' onClick={editTask}>
          <Check />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default EditTask;
