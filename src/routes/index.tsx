import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { CircleMinus, LogOut, Plus, SearchX } from 'lucide-react';
import { useMemo, useOptimistic, useState, useTransition, ViewTransition } from 'react';
import { toast } from 'sonner';

import { EditTask } from '@/components/edit-task';
import { EmptyTask } from '@/components/empty-task';
import { LoadingScreen } from '@/components/loading-screen';
import { NewTask } from '@/components/new-task';
import { SearchTask } from '@/components/search-task';
import { Task } from '@/components/task';
import { Button } from '@/components/ui/button';
import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { authClient } from '@/lib/auth-client';
import { queryClient, api } from '@/utils/trpc';

import type { OptimisticTaskAction, TaskStatus, TasksList } from '../types/task';

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

  const { isEditing, setIsEditing } = useTaskContext();
  const navigate = useNavigate();
  const isSessionLoading = authClient.useSession().isPending;

  const [, startTransition] = useTransition();
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  const queryKey = api.getTasks.queryKey({ userId: user.id });

  const [optimisticTask, mutateOptimisticTask] = useOptimistic(
    tasks,
    (state: TasksList, action: OptimisticTaskAction): TasksList => {
      switch (action.type) {
        case 'edit':
          return state.map((t) =>
            t.id === action.payload.id ? { ...t, task: action.payload.task, pending: true } : t,
          );
        case 'update':
          return state.map((t) =>
            t.id === action.payload.id ? { ...t, status: action.payload.status } : t,
          );
        case 'delete':
          return state.filter((t) => t.id !== action.payload.id);
        default:
          return state;
      }
    },
  );

  const createTaskMutation = useMutation(
    api.createTask.mutationOptions({
      onSuccess: () => toast.success('Task created!'),
      onError: (error) => toast.error(error.message),
    }),
  );

  const updateTaskMutation = useMutation(
    api.updateTask.mutationOptions({
      onSuccess: () => toast.success('Task updated!'),
      onError: (error) => toast.error(error.message),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    }),
  );

  const deleteTaskMutation = useMutation(
    api.deleteTask.mutationOptions({
      onSuccess: () => toast.success('Task deleted!'),
      onError: (error) => toast.error(error.message),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    }),
  );

  const editTaskMutation = useMutation(
    api.editTask.mutationOptions({
      onSuccess: () => toast('Task edited successfully!'),
      onError: (error) => toast.error(error.message),
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    }),
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

  const openCreate = () => startTransition(() => setShowTaskInput(true));

  const closeCreate = () => startTransition(() => setShowTaskInput(false));

  const startEdit = (id: string) => {
    startTransition(() => {
      setIsEditing(id);
    });
    closeCreate();
  };

  const handleCreate = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Show a pending row in the list immediately by writing it to the cache
    // (with pending: true). The mutation runs in the background and on success
    // replaces the placeholder with the canonical row (same id) so the
    // ViewTransition just cross-fades the shimmer away.
    startTransition(() => {
      queryClient.setQueryData(queryKey, (old: TasksList | undefined) => {
        const list = old ?? [];
        if (list.some((t) => t.id === id)) return list;
        return [
          ...list,
          {
            id,
            userId: user.id,
            task: trimmed,
            status: 'pending' as const,
            createdAt: now,
            updatedAt: now,
            pending: true,
          },
        ];
      });
    });

    createTaskMutation.mutate(
      { id, userId: user.id, task: trimmed },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey });
        },
      },
    );

    closeCreate();
  };

  const handleToggle = (id: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    startTransition(async () => {
      mutateOptimisticTask({ type: 'update', payload: { id, status: newStatus } });
      updateTaskMutation.mutate({ id, status: newStatus });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      mutateOptimisticTask({ type: 'delete', payload: { id } });
      deleteTaskMutation.mutate({ id });
    });
  };

  const handleEdit = (id: string, nextText: string) => {
    const trimmed = nextText.trim();
    if (!trimmed) return;
    startTransition(() => {
      mutateOptimisticTask({ type: 'edit', payload: { id, task: trimmed } });
      editTaskMutation.mutate({ id, task: trimmed });
      setIsEditing(null);
    });
  };

  const cancelEdit = () => startTransition(() => setIsEditing(null));

  // Alt + T to toggle create task input
  useKeyboardShortcut({ key: 't', alt: true }, () =>
    startTransition(() => setShowTaskInput((prev) => !prev)),
  );

  // Escape to close create task input
  useKeyboardShortcut({ key: 'Escape' }, () => startTransition(() => setShowTaskInput(false)), {
    enabled: showTaskInput,
  });

  const toMs = (d: string | Date | null) => (d ? new Date(d).getTime() : 0);

  const sortedTasks = useMemo(
    () =>
      [...optimisticTask].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          toMs(b.createdAt) - toMs(b.createdAt),
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
            <ul className='m-0 flex list-none flex-col p-0'>
              {filteredTasks.map((task) =>
                isEditing === task.id ? (
                  <ViewTransition key={`edit-${task.id}`} enter='scale' exit='scale'>
                    <li className='block'>
                      <EditTask
                        task={task.task}
                        onSave={(next) => handleEdit(task.id, next)}
                        onCancel={cancelEdit}
                      />
                    </li>
                  </ViewTransition>
                ) : (
                  <ViewTransition key={task.id} enter='slide-up' exit='scale'>
                    <li className='block'>
                      <Task
                        {...task}
                        onEdit={() => startEdit(task.id)}
                        onDelete={() => handleDelete(task.id)}
                        onToggle={() => handleToggle(task.id, task.status)}
                      />
                    </li>
                  </ViewTransition>
                ),
              )}
            </ul>
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
                    action={openCreate}
                    title='No Tasks Created'
                    description='You have not created any tasks yet. Click the button below to create your first task.'
                  />
                ))}
            </div>
          )}
        </div>

        <div>
          {showTaskInput ? (
            <NewTask onCreate={handleCreate} onCancel={closeCreate} />
          ) : (
            !isEditing && (
              <Button
                onClick={openCreate}
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
