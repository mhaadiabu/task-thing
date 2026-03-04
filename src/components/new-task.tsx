import { useMutation } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useRef, useState, ViewTransition } from 'react';
import { toast } from 'sonner';

import { queryClient, api } from '@/utils/trpc';

import type { OptimisticTaskAction } from '../types/task';
import { tryCatch } from '../lib/utils/try-catch';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const NewTask = ({
  addOptimisticTask,
  onCancel,
  userId,
}: {
  addOptimisticTask: (action: OptimisticTaskAction) => void;
  onCancel: () => void;
  userId: string;
}) => {
  const [task, setTask] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryKey = api.getTasks.queryKey({ userId });

  const newTask = useMutation(
    api.createTask.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success('Task created successfully!');
      },
    }),
  );

  const createTask = async () => {
    if (task.length < 1) {
      if (inputRef.current) {
        inputRef.current.setAttribute('aria-invalid', 'true');
      }
      return;
    }

    addOptimisticTask({
      type: 'create',
      payload: {
        id: crypto.randomUUID(),
        task: task.trim(),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        userId: userId,
      },
    });

    const { error } = await tryCatch(newTask.mutateAsync({ userId, task: task.trim() }));
    if (error) toast(error.message);

    setTask('');
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
    if (e.target.value.length > 0 && inputRef.current) {
      inputRef.current.setAttribute('aria-invalid', 'false');
    }
  };

  return (
    <ViewTransition enter='slide-up' exit='slide-down' update='slide-down'>
      <div className='mx-auto flex w-full flex-col items-end gap-2.5 py-2'>
        <Textarea
          ref={inputRef}
          name='task'
          value={task}
          placeholder='Add a new task...'
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) createTask();
          }}
          aria-invalid='false'
          rows={1}
          autoFocus
        />
        <ButtonGroup>
          <Button variant='destructive' onClick={onCancel}>
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
