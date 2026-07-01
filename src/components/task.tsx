import { Edit3, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

export const Task = ({
  className,
  id,
  onDelete,
  onEdit,
  onToggle,
  pending,
  status,
  task,
}: {
  className?: string;
  createdAt: string | Date | null;
  id: string;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: () => void;
  pending?: boolean;
  status: 'pending' | 'completed';
  task: string;
  updatedAt: string | Date | null;
  userId: string;
}) => {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-2 py-2',
        pending && 'shimmer rounded-md',
        className,
      )}
    >
      <div className='flex items-start gap-2'>
        <Checkbox
          id={`task-${id}`}
          checked={status === 'completed'}
          onCheckedChange={onToggle}
        />
        <Label
          htmlFor={`task-${id}`}
          className={cn(
            status === 'completed' ? 'text-muted-foreground line-through' : 'no-underline',
            'word-wrap whitespace-pre-wrap',
          )}
        >
          {task}
        </Label>
      </div>

      <ButtonGroup>
        <Button size='icon' onClick={onEdit}>
          <Edit3 />
        </Button>
        <Button size='icon' variant='destructive' onClick={onDelete}>
          <Trash2 />
        </Button>
      </ButtonGroup>
    </div>
  );
};