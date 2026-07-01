import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Textarea } from './ui/textarea';

export const EditTask = ({
  onCancel,
  onSave,
  task,
}: {
  onCancel: () => void;
  onSave: (next: string) => void;
  task: string;
}) => {
  const [editedTask, setEditedTask] = useState(task);

  const submit = () => {
    if (!editedTask.trim()) return;
    onSave(editedTask);
  };

  return (
    <div className='mx-auto flex w-full flex-col items-end justify-center gap-2 py-2.5'>
      <Textarea
        name='edit-task'
        value={editedTask}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedTask(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            submit();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        autoFocus
      />

      <ButtonGroup>
        <Button
          variant='destructive'
          size='icon'
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCancel}
        >
          <X />
        </Button>
        <Button size='icon' onMouseDown={(e) => e.preventDefault()} onClick={submit}>
          <Check />
        </Button>
      </ButtonGroup>
    </div>
  );
};