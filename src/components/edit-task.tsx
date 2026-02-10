import { useTaskContext } from '@/context/TaskContext';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { startTransition, useState, ViewTransition } from 'react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const EditTask = ({
  id,
  userId,
  task,
}: {
  id: string;
  userId: string;
  task: string;
}) => {
  const { setIsEditing } = useTaskContext();

  const [editedTask, setEditedTask] = useState(task);

  const edit = useMutation(
    trpc.editTask.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const editTask = () => {
    edit.mutate({ id, task: editedTask.trim() });
    startTransition(() => setIsEditing(null));
  };

  return (
    <ViewTransition enter='scale-up' exit='scale-down'>
      <div className='flex flex-col gap-2 justify-center items-end w-full mx-auto py-2.5'>
        <Textarea
          name='edit-task'
          value={editedTask}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setEditedTask(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (
              (e.key === 'Enter' && e.ctrlKey) ||
              (e.key === 'Return' && e.ctrlKey)
            ) {
              editTask();
            } else if (e.key === 'Escape') {
              startTransition(() => setIsEditing(null));
            }
          }}
          onBlur={() => startTransition(() => setIsEditing(null))}
          autoFocus
        />

        <ButtonGroup>
          <Button
            variant='destructive'
            size='icon'
            onClick={() => startTransition(() => setIsEditing(null))}
          >
            <X />
          </Button>
          <Button size='icon' onClick={editTask}>
            <Check />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
