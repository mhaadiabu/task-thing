import { useTaskContext } from '@/context/TaskContext';
import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Input } from './ui/input';

interface EditTaskProps {
  id: string;
  task: string;
}

const EditTask = ({ id, task }: EditTaskProps) => {
  const { setIsEditing } = useTaskContext();

  const [editedTask, setEditedTask] = useState(task);

  const edit = useMutation(
    trpc.editTask.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.editTask.mutationKey(),
        });
      },
    }),
  );

  const editTask = () => {
    edit.mutate({ id: id, task: editedTask.trim() });

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
