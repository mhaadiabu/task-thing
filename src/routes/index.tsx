import { NewTask } from '@/components/new-task';
import { EditTask } from '@/components/edit-task';
import { SearchTask } from '@/components/search-task';
import { Task } from '@/components/task';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CircleMinus, LogOut, Plus, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyTask } from '@/components/empty-task';
import type { TaskStatus } from '../types/task';

export const Route = createFileRoute('/')({
  component: App,
});

const STATUS_ORDER: Array<TaskStatus> = ['pending', 'completed'];

/**
 * Render the main tasks UI with search, list, create/edit controls, and auth-aware navigation.
 *
 * Redirects unauthenticated users to "/auth/sign-in" when authentication is not loading, shows a loading indicator while auth/data load, filters displayed tasks by the search input, and provides keyboard shortcuts (Alt+T toggles the create-task input; Escape closes it).
 *
 * @returns The root JSX element for the tasks application UI
 */
function App() {
  const navigate = useNavigate();
  const { isEditing } = useTaskContext();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  if (!isSessionLoading && !session?.user) {
    navigate({ to: '/auth/sign-in' });
  }

  const user = session?.user;

  const { data: tasks } = useQuery(
    trpc.getTasks.queryOptions({ userId: user?.id || '' }, { enabled: !!user }),
  );

  // Alt + T to toggle create task input
  useKeyboardShortcut({ key: 't', alt: true }, () => {
    setShowTaskInput((prev) => !prev);
  });

  // Escape to close create task input
  useKeyboardShortcut(
    { key: 'Escape' },
    () => {
      setShowTaskInput(false);
    },
    { enabled: showTaskInput },
  );

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];

    return [...tasks].sort((a, b) => {
      const statusDiff =
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);

      if (statusDiff !== 0) return statusDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const filteredTasks = sortedTasks?.filter(({ task }) =>
    task.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className='bg-background text-foreground font-medium w-full min-h-screen px-4 py-7 text-base dark'>
      {isSessionLoading ? (
        <div className='w-full h-screen flex justify-center items-center'>
          <Spinner className='size-12' />
        </div>
      ) : (
        <div className='flex flex-col max-w-5xl mx-auto py-4 sm:py-6 overflow-none'>
          <div className='flex w-full justify-between items-center'>
            <h3 className='text-lg font-semibold capitalize text-left'>
              Tasks
            </h3>

            <Button
              variant='destructive'
              size='sm'
              onClick={async () => await authClient.signOut()}
            >
              <LogOut />
              <span>Sign Out</span>
            </Button>
          </div>

          <div className='flex w-full items-center gap-2 mt-4'>
            <SearchTask
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>

          <div className='flex flex-col w-full divide-y divide-border'>
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) =>
                isEditing === task.id ? (
                  <EditTask
                    key={task.id}
                    id={task.id}
                    userId={task.userId}
                    task={task.task}
                  />
                ) : (
                  <Task key={task.id} {...task} />
                ),
              )
            ) : (
              <div className='w-full h-full flex flex-col justify-center items-center gap-4 text-muted-foreground'>
                {!showTaskInput &&
                  (search ? (
                    <EmptyTask
                      icon={<SearchX />}
                      title='Task Not Found'
                      description='Try searching for something else'
                    />
                  ) : (
                    <EmptyTask
                      icon={<CircleMinus />}
                      action={() => setShowTaskInput(true)}
                      title='No Tasks Created'
                      description='You have not created any tasks yet. Click the button below to create your first task.
'
                    />
                  ))}
              </div>
            )}
          </div>

          <div>
            {showTaskInput ? (
              <NewTask
                userId={user?.id || ''}
                cancel={() => setShowTaskInput(false)}
              />
            ) : (
              <Button
                onClick={() => setShowTaskInput(true)}
                className='fixed bottom-6 right-4 shadow-lg dark:shadow shadow-primary/65 dark:shadow-primary/35'
              >
                <Plus />
                <span className='max-md:hidden'>New Task</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
