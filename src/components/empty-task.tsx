import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { ViewTransition } from 'react';

export const EmptyTask = ({
  action,
  icon,
  title,
  description,
}: {
  action?: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <ViewTransition enter='scale-up' exit='scale-down'>
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {title === 'No Tasks Created' && (
          <Button size='sm' onClick={action}>
            <Plus />
            Create Task
          </Button>
        )}
      </EmptyContent>
    </Empty>
  </ViewTransition>
);
