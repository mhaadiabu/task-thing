import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { CircleMinus, LogOut, Plus, SearchX } from 'lucide-react';
import { startTransition, Suspense, useMemo, useOptimistic, useState } from 'react';

import { EditTask } from '@/components/edit-task';
import { EmptyTask } from '@/components/empty-task';
import { LoadingScreen } from '@/components/loading-screen';
import { NewTask } from '@/components/new-task';
import { SearchTask } from '@/components/search-task';
import { Task } from '@/components/task';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableRow } from '@/components/ui/table';
import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { authClient } from '@/lib/auth-client';
import { api } from '@/utils/trpc';

import type { Task as TaskTypes, TaskStatus } from '../types/task';

type Tasks = Omit<TaskTypes, 'updatedAt'>;

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    const user = session?.user;

    if (!user) throw redirect({ to: '/auth/sign-in' });
    return { user };
  },
  loader: async ({ context: { user, queryClient } }) => {
    const tasks = await queryClient.ensureQueryData(api.getTasks.queryOptions({ userId: user.id }));

    return { tasks };
  },
  component: App,
});

const STATUS_ORDER: Array<TaskStatus> = ['pending', 'completed'];

/**
 * Render the main tasks UI with search, list, create/edit controls, and auth-aware navigation.
 */
function App() {
  const { user } = Route.useRouteContext();
  const { data: tasks } = useSuspenseQuery(api.getTasks.queryOptions({ userId: user.id }));

  const { isEditing } = useTaskContext();
  const navigate = useNavigate();
  const isSessionLoading = authClient.useSession().isPending;

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  const [optimisticTask, addOptimisticTask] = useOptimistic(
    tasks.map((task) => task as Tasks),
    (state, newTask: Tasks) => [...state, newTask],
  );

  const signOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.disabled = true;

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/auth/sign-in' });
        },
        onError: () => {
          e.currentTarget.disabled = false;
        },
      },
    });
  };

  // Alt + T to toggle create task input
  useKeyboardShortcut({ key: 't', alt: true }, () => {
    startTransition(() => setShowTaskInput((prev) => !prev));
  });

  // Escape to close create task input
  useKeyboardShortcut(
    { key: 'Escape' },
    () => {
      startTransition(() => setShowTaskInput(false));
    },
    { enabled: showTaskInput },
  );

  const toMs = (d: string | Date | null) => (d ? new Date(d).getTime() : 0);

  const sortedTasks = useMemo(
    () =>
      [...optimisticTask].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          toMs(b.createdAt) - toMs(a.createdAt),
      ),
    [optimisticTask],
  );

  const filteredTasks = sortedTasks.filter(({ task }) =>
    task.toLowerCase().includes(search.toLowerCase()),
  );

  if (isSessionLoading) return <LoadingScreen />;

  return (
    <main className='dark min-h-screen w-full bg-background px-4 py-7 text-base font-medium text-foreground'>
      <div className='overflow-none mx-auto flex max-w-5xl flex-col py-4 sm:py-6'>
        <div className='flex w-full items-center justify-between'>
          <h3 className='text-left text-lg font-semibold capitalize'>Tasks</h3>

          <Button variant='destructive' size='sm' onClick={signOut}>
            <LogOut />
            <span>Sign Out</span>
          </Button>
        </div>

        <div className='mt-4 flex w-full items-center gap-2'>
          <SearchTask
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>

        <div className='flex w-full flex-col divide-y divide-border'>
          {filteredTasks && filteredTasks.length > 0 ? (
            <Table>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    {isEditing === task.id ? (
                      <EditTask id={task.id} userId={task.userId} task={task.task} />
                    ) : (
                      <Suspense fallback={<div>Loading...</div>}>
                        <Task {...task} />
                      </Suspense>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='flex h-full w-full flex-col items-center justify-center gap-4 text-muted-foreground'>
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
                    action={() => startTransition(() => setShowTaskInput(true))}
                    title='No Tasks Created'
                    description='You have not created any tasks yet. Click the button below to create your first task.'
                  />
                ))}
            </div>
          )}
        </div>

        <div>
          {showTaskInput ? (
            <NewTask
              addOptimisticTask={addOptimisticTask}
              userId={user?.id || ''}
              onCancel={() => startTransition(() => setShowTaskInput(false))}
            />
          ) : (
            !isEditing && (
              <Button
                onClick={() => startTransition(() => setShowTaskInput(true))}
                className='fixed right-4 bottom-6 shadow-lg shadow-primary/65 dark:shadow dark:shadow-primary/35'
              >
                <Plus />
                <span className='max-md:hidden'>New Task</span>
              </Button>
            )
          )}
        </div>
      </div>
    </main>
  );
}
