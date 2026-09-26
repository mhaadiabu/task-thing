import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { CircleMinus, LogOut, Plus, SearchX } from 'lucide-react';
import { useMemo, useOptimistic, useRef, useState, startTransition, ViewTransition } from 'react';
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

import type { OptimisticTaskAction, Task as TaskItem, TaskStatus, TasksList } from '../types/task';

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
 * Run a UI update inside a transition. Finishes any running view
 * transition first so fast clicks respond right away instead of
 * queueing behind the current animation.
 */
function animate(update: () => void) {
  document.activeViewTransition?.skipTransition();
  startTransition(update);
}

/**
 * Render the main tasks UI with search, list, create/edit controls, and auth-aware navigation.
 */
function App() {
  const { user } = Route.useRouteContext();
  const { data: tasks } = useSuspenseQuery(api.getTasks.queryOptions({ userId: user.id }));

  const { isEditing, setIsEditing } = useTaskContext();
  const navigate = useNavigate();
  const isSessionLoading = authClient.useSession().isPending;

  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');

  const queryKey = api.getTasks.queryKey({ userId: user.id });

  const [optimisticTask, mutateOptimisticTask] = useOptimistic(
    tasks,
    (state: TasksList, action: OptimisticTaskAction): TasksList => {
      switch (action.type) {
        case 'create':
          return state.some((t) => t.id === action.payload.id) ? state : [...state, action.payload];
        case 'edit':
          return state.map((t) =>
            t.id === action.payload.id
              ? { ...t, task: action.payload.task, pending: action.payload.pending ?? true }
              : t,
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

  // Per-row operation sequence. With a slow backend, settles can land out
  // of order or after newer ops; only the latest op for a row may reconcile
  // or roll back, otherwise a stale settle yanks the row back mid-animation.
  const rowSeq = useRef<Record<string, number>>({});

  const beginOp = (id: string) => {
    const seq = (rowSeq.current[id] ?? 0) + 1;
    rowSeq.current[id] = seq;
    return seq;
  };

  const isLatestOp = (id: string, seq: number) => rowSeq.current[id] === seq;

  // Cache writes commit synchronously outside transitions, so the cache only
  // ever holds server truth reconciled with zero-layout-delta writes (same
  // order, same visuals). Every visible change goes through the optimistic
  // layer above, which paints inside transitions and animates.
  const prepareOp = (id: string) => {
    const seq = beginOp(id);
    const done = queryClient.cancelQueries({ queryKey }).then(() => ({ seq }));
    return done;
  };

  const createTaskMutation = useMutation(
    api.createTask.mutationOptions({
      onMutate: ({ id }) => prepareOp(id),
      onSuccess: (row, _vars, context) => {
        if (!row || !context || !isLatestOp(row.id, context.seq)) return;
        toast.success('Task created!');
        // Swap the placeholder for the canonical row. Same position, only
        // the shimmer flag changes, so this commit is invisible.
        queryClient.setQueryData(queryKey, (old: TasksList | undefined) =>
          (old ?? []).map((t) => (t.id === row.id ? { ...row } : t)),
        );
      },
      onError: (error, vars) => {
        toast.error(error.message);
        // Undo the placeholder through the optimistic layer so it fades out.
        animate(() => mutateOptimisticTask({ type: 'delete', payload: { id: vars.id } }));
      },
    }),
  );

  const updateTaskMutation = useMutation(
    api.updateTask.mutationOptions({
      onMutate: ({ id }) => prepareOp(id),
      onSuccess: (_data, { id, status }, context) => {
        if (!context || !isLatestOp(id, context.seq)) return;
        toast.success('Task updated!');
        queryClient.setQueryData(queryKey, (old: TasksList | undefined) =>
          (old ?? []).map((t) => (t.id === id ? { ...t, status } : t)),
        );
      },
      onError: (error, { id, status }, context) => {
        toast.error(error.message);
        if (!context || !isLatestOp(id, context.seq)) return;
        // Flip back through the optimistic layer so the row glides home.
        const prev: TaskStatus = status === 'pending' ? 'completed' : 'pending';
        animate(() => mutateOptimisticTask({ type: 'update', payload: { id, status: prev } }));
      },
    }),
  );

  const deleteTaskMutation = useMutation(
    api.deleteTask.mutationOptions({
      onMutate: ({ id }) => prepareOp(id),
      onSuccess: (_data, { id }, context) => {
        if (!context || !isLatestOp(id, context.seq)) return;
        toast.success('Task deleted!');
        queryClient.setQueryData(queryKey, (old: TasksList | undefined) =>
          (old ?? []).filter((t) => t.id !== id),
        );
      },
      onError: (error, { id }, context) => {
        toast.error(error.message);
        if (!context || !isLatestOp(id, context.seq)) return;
        // Re-insert the lost row through the optimistic layer so it glides back.
        const row = queryClient.getQueryData<TasksList>(queryKey)?.find((t) => t.id === id);
        if (!row) return;
        const restore: TaskItem = { ...row };
        animate(() => mutateOptimisticTask({ type: 'create', payload: restore }));
      },
    }),
  );

  const editTaskMutation = useMutation(
    api.editTask.mutationOptions({
      onMutate: ({ id }) => prepareOp(id),
      onSuccess: (_data, { id, task }, context) => {
        if (!context || !isLatestOp(id, context.seq)) return;
        toast('Task edited successfully!');
        // Write the confirmed text and clear the pending shimmer.
        queryClient.setQueryData(queryKey, (old: TasksList | undefined) =>
          (old ?? []).map((t) => (t.id === id ? { ...t, task, pending: false } : t)),
        );
      },
      onError: (error, { id }, context) => {
        toast.error(error.message);
        if (!context || !isLatestOp(id, context.seq)) return;
        // Restore the previous text through the optimistic layer (without
        // re-marking it pending: no confirmation is coming).
        const prev = queryClient.getQueryData<TasksList>(queryKey)?.find((t) => t.id === id);
        if (!prev) return;
        animate(() =>
          mutateOptimisticTask({ type: 'edit', payload: { id, task: prev.task, pending: false } }),
        );
      },
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

  const openCreate = () => animate(() => setShowTaskInput(true));

  const closeCreate = () => animate(() => setShowTaskInput(false));

  const startEdit = (id: string) => {
    animate(() => {
      setIsEditing(id);
    });
    closeCreate();
  };

  const handleCreate = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Dispatch the placeholder through the optimistic layer (not the query
    // cache: cache writes commit outside transitions and can't animate).
    // It sorts straight to the top, so it rises in while the list drops.
    animate(() => {
      mutateOptimisticTask({
        type: 'create',
        payload: {
          id,
          userId: user.id,
          task: trimmed,
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now,
          pending: true,
        },
      });
    });

    createTaskMutation.mutate({ id, userId: user.id, task: trimmed });

    closeCreate();
  };

  const handleToggle = (id: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    animate(() => {
      mutateOptimisticTask({ type: 'update', payload: { id, status: newStatus } });
      updateTaskMutation.mutate({ id, status: newStatus });
    });
  };

  const handleDelete = (id: string) => {
    animate(() => {
      mutateOptimisticTask({ type: 'delete', payload: { id } });
      deleteTaskMutation.mutate({ id });
    });
  };

  const handleEdit = (id: string, nextText: string) => {
    const trimmed = nextText.trim();
    if (!trimmed) return;
    animate(() => {
      mutateOptimisticTask({ type: 'edit', payload: { id, task: trimmed } });
      editTaskMutation.mutate({ id, task: trimmed });
      setIsEditing(null);
    });
  };

  const cancelEdit = () => animate(() => setIsEditing(null));

  // Alt + T to toggle create task input. Keyboard-driven changes set state
  // directly (no transition) so they feel instant.
  useKeyboardShortcut({ key: 't', alt: true }, () => {
    document.activeViewTransition?.skipTransition();
    setShowTaskInput((prev) => !prev);
  });

  // Escape to close create task input
  useKeyboardShortcut(
    { key: 'Escape' },
    () => {
      document.activeViewTransition?.skipTransition();
      setShowTaskInput(false);
    },
    {
      enabled: showTaskInput,
    },
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
            <ul className='m-0 flex list-none flex-col p-0'>
              {filteredTasks.map((task) =>
                isEditing === task.id ? (
                  <ViewTransition key={`edit-${task.id}`} default='vt-move vt-presence'>
                    <li className='block'>
                      <EditTask
                        task={task.task}
                        onSave={(next) => handleEdit(task.id, next)}
                        onCancel={cancelEdit}
                      />
                    </li>
                  </ViewTransition>
                ) : (
                  <ViewTransition key={task.id} default='vt-move vt-presence'>
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
