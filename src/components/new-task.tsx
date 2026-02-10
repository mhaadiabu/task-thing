import { queryClient, trpc } from '@/utils/trpc';
import { useMutation } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useRef, useState, ViewTransition } from 'react';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const NewTask = ({
  cancel,
  userId,
}: {
  cancel: () => void;
  userId: string;
}) => {
  const [taskItem, setTaskItem] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const newTask = useMutation(
    trpc.createTask.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.getTasks.queryKey({ userId }),
        });
      },
    }),
  );

  const createTask = () => {
    if (taskItem.length < 1) {
      if (inputRef.current) {
        inputRef.current.setAttribute('aria-invalid', 'true');
      }
      return;
    }

    newTask.mutate({ userId, task: taskItem.trim() });

    setTaskItem('');
    cancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskItem(e.target.value);
    if (e.target.value.length > 0 && inputRef.current) {
      inputRef.current.setAttribute('aria-invalid', 'false');
    }
  };

  return (
    <ViewTransition enter='slide-up' exit='slide-down' update='slide-down'>
      <div className='flex flex-col w-full mx-auto py-2 gap-2.5 items-end'>
        <Textarea
          ref={inputRef}
          name='task'
          value={taskItem}
          placeholder='Add a new task...'
          onChange={handleChange}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === 'Return') && createTask()
          }
          aria-invalid='false'
          rows={1}
          autoFocus
        />
        <ButtonGroup>
          <Button variant='destructive' onClick={cancel}>
            <X />
            <span className='max-md:hidden'>Cancel</span>
          </Button>

          <Button onClick={createTask}>
            <span className='max-md:hidden'>Click to Add</span>
            <Plus />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
