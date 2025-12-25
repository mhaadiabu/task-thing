import CreateTask from '@/components/CreateTask';
import EditTask from '@/components/EditTask';
import SearchTask from '@/components/SearchTask';
import Tasks from '@/components/Tasks';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

export const Route = createFileRoute('/')({
  component: App,
});

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
  // const { session, isLoading, user } = useAuth();

  // Use Better Auth's built-in useSession hook for reactive session state
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  // Redirect to sign-in if not authenticated
  if (!isFetching && !isSessionLoading && !session?.user) {
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

  const filteredTasks = tasks?.filter(({ task }) =>
    task.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className='bg-background text-foreground font-medium w-full min-h-svh px-4 py-7 font-mono text-base dark'>
      {isFetching || isSessionLoading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col max-w-5xl mx-auto py-4 sm:py-6 overflow-none'>
          <div className='flex w-full items-center'>
            <SearchTask
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />

            <Button
              variant='destructive'
              onClick={async () => await authClient.signOut()}
              className='max-w-lg:hidden'
            >
              Sign Out
            </Button>
          </div>

          <div className='flex flex-col gap-2.5 mt-4 w-full'>
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
                  <Tasks
                    key={task.id}
                    {...task}
                    className='not-last:border-b pb-2.5'
                  />
                ),
              )
            ) : (
              <div className='w-full h-64 flex flex-col justify-center items-center gap-4 text-muted-foreground'>
                <p>{search ? 'No tasks match your search' : 'No tasks yet'}</p>
                {!search && !showTaskInput && (
                  <Button
                    onClick={() => setShowTaskInput(true)}
                    className='shadow-lg dark:shadow shadow-primary/65 dark:shadow-primary/35'
                  >
                    <Plus />
                    <span>Create your first task</span>
                  </Button>
                )}
              </div>
            )}
          </div>
          <div>
            {showTaskInput ? (
              <CreateTask
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
