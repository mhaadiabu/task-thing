import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { startTransition, useState, ViewTransition } from 'react';
import { toast } from 'sonner';

import { useTaskContext } from '@/context/TaskContext';
import { queryClient, api } from '@/utils/trpc';

import type { OptimisticTaskAction } from '../types/task';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const EditTask = ({
  editOptimisticTask,
  id,
  userId,
  task,
}: {
  editOptimisticTask: (action: OptimisticTaskAction) => void;
  id: string;
  userId: string;
  task: string;
}) => {
  const { setIsEditing } = useTaskContext();

  const [editedTask, setEditedTask] = useState(task);

  const edit = useMutation(
    api.editTask.mutationOptions({
      onSettled: () => {
        toast('Task edited succesfully!');
        queryClient.invalidateQueries({
          queryKey: api.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const cancel = () => startTransition(() => setIsEditing(null));

  const editTask = () => {
    if (!editedTask) return;
    startTransition(() => {
      editOptimisticTask({ type: 'edit', payload: { id, task: editedTask.trim() } });
      edit.mutate({ id, task: editedTask.trim() });
      setIsEditing(null);
    });
  };

  return (
    <ViewTransition enter='scale-up' exit='scale-down'>
      <div className='mx-auto flex w-full flex-col items-end justify-center gap-2 py-2.5'>
        <Textarea
          name='edit-task'
          value={editedTask}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedTask(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              editTask();
            } else if (e.key === 'Escape') {
              cancel();
            }
          }}
          autoFocus
        />

        <ButtonGroup>
          <Button
            variant='destructive'
            size='icon'
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancel}
          >
            <X />
          </Button>
          <Button size='icon' onMouseDown={(e) => e.preventDefault()} onClick={editTask}>
            <Check />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
