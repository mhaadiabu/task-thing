import { Plus, X } from 'lucide-react';
import { useRef, useState, ViewTransition } from 'react';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const NewTask = ({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (text: string) => void;
}) => {
  const [task, setTask] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (task.length < 1) {
      if (inputRef.current) {
        inputRef.current.setAttribute('aria-invalid', 'true');
      }
      return;
    }
    onCreate(task);
    setTask('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
    if (e.target.value.length > 0 && inputRef.current) {
      inputRef.current.setAttribute('aria-invalid', 'false');
    }
  };

  return (
    <ViewTransition enter='slide-up' exit='scale'>
      <div className='mx-auto flex w-full flex-col items-end gap-2.5 py-2'>
        <Textarea
          ref={inputRef}
          name='task'
          value={task}
          placeholder='Add a new task...'
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) submit();
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

          <Button onClick={submit}>
            <span className='max-md:hidden'>Click to Add</span>
            <Plus />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
