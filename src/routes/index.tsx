import { useTaskContext } from '@/context/TaskContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import CreateTask from '@/components/CreateTask';
import EditTask from '@/components/EditTask';
import SearchTask from '@/components/SearchTask';
import Tasks from '@/components/Tasks';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [search, setSearch] = useState('');
  const { tasks, isEditing } = useTaskContext();

  const { data: session, isPending: loading } = authClient.useSession();

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

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) =>
        task.task.toLowerCase().includes(search.toLowerCase()),
      ),
    [tasks, search],
  );

  console.log(filteredTasks);
  console.log(session?.user.name);

  return (
    <main className='bg-background text-foreground font-medium w-full min-h-svh px-4 py-7 font-mono text-base dark'>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className='flex flex-col max-w-5xl mx-auto py-4 sm:py-6 overflow-none'>
          <SearchTask
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />

          <div className='flex flex-col gap-2.5 mt-4 w-full'>
            {filteredTasks.map((task) =>
              isEditing === task.id ? (
                <EditTask key={task.id} id={task.id} task={task.task} />
              ) : (
                <Tasks
                  key={task.id}
                  {...task}
                  className='not-last:border-b pb-2.5'
                />
              ),
            )}
          </div>
          <div>
            {showTaskInput ? (
              <CreateTask onCancel={() => setShowTaskInput((prev) => !prev)} />
            ) : (
              <Button
                onClick={() => setShowTaskInput((prev) => !prev)}
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
};
