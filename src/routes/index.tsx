import CreateTask from '@/components/CreateTask';
import EditTask from '@/components/EditTask';
import SearchTask from '@/components/SearchTask';
import Tasks from '@/components/Tasks';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useAuth } from '@/lib/auth-client';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

/**
 * Renders the main tasks application UI, handling task display, searching, creation/editing, and auth-based navigation.
 *
 * Redirects unauthenticated users to "/auth/sign-in" when authentication is not loading, displays a loading indicator while data is loading, filters tasks by the search input, shows an edit form when a task is in edit mode, and provides keyboard shortcuts (Alt+T to toggle the create-task input, Escape to close it).
 *
 * @returns The rendered application UI as JSX.Element
 */
function App() {
  const navigate = useNavigate();
  const { isEditing } = useTaskContext();
  const { session, isLoading, user, isAuthenticated } = useAuth();

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  if ((!session && !isLoading) || !isAuthenticated) navigate({ to: '/auth/sign-in' });

  const { data: tasks } = useQuery(
    trpc.getTasks.queryOptions({ userId: user!.id }),
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

  const filteredTasks = tasks?.filter(({ task }) =>
    task.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className='bg-background text-foreground font-medium w-full min-h-svh px-4 py-7 font-mono text-base dark'>
      {isLoading ? (
        <div className='w-full h-svh justify-center items-center'>
          Loading...
        </div>
      ) : (
        <div className='flex flex-col max-w-5xl mx-auto py-4 sm:py-6 overflow-none'>
          <SearchTask
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />

          <p>{user?.name}</p>

          <div className='flex flex-col gap-2.5 mt-4 w-full'>
            {filteredTasks &&
              filteredTasks.map((task) => {
                return isEditing === task.id ? (
                  <EditTask key={task.id} id={task.id} task={task.task} />
                ) : filteredTasks.length > 0 && !showTaskInput ? (
                  <div className='w-full h-svh flex justify-center items-center'>
                    <Button
                      onClick={() => setShowTaskInput(true)}
                      className='shadow-lg dark:shadow shadow-primary/65 dark:shadow-primary/35'
                    >
                      <Plus />
                      <span className='max-md:hidden'>New Task</span>
                    </Button>
                  </div>
                ) : (
                  <Tasks
                    key={task.id}
                    {...task}
                    className='not-last:border-b pb-2.5'
                  />
                );
              })}
          </div>
          <div>
            {showTaskInput ? (
              <CreateTask cancel={() => setShowTaskInput(false)} />
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