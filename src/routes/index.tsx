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

function App() {
  const navigate = useNavigate();
  const [ showTaskInput, setShowTaskInput ] = useState(false);
  const [ search, setSearch ] = useState('');
  const { isEditing } = useTaskContext();
  const { data: tasks } = useQuery(trpc.getTasks.queryOptions());

  const { session, isLoading, user } = useAuth();

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

  if (!session && !isLoading) {
    navigate({ to: '/auth/sign-in' });
  }

  if (!tasks) return 'No tasks yet';

  const filteredTasks = tasks.filter(({ task }) =>
    task.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <main className='bg-background text-foreground font-medium w-full min-h-svh px-4 py-7 font-mono text-base dark'>
      { isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className='flex flex-col max-w-5xl mx-auto py-4 sm:py-6 overflow-none'>
          <SearchTask
            value={ search }
            onChange={ (e) => setSearch(e.target.value) }
            onClear={ () => setSearch('') }
          />

          <p>{ user?.name }</p>

          <div className='flex flex-col gap-2.5 mt-4 w-full'>
            { filteredTasks.map(({ task, id, status }) =>
              isEditing === id ? (
                <EditTask key={ id } id={ id } task={ task } />
              ) : (
                <Tasks
                  key={ id }
                  id={ id }
                  task={ task }
                  status={ status }
                  className='not-last:border-b pb-2.5'
                />
              ),
            ) }
          </div>
          <div>
            { showTaskInput ? (
              <CreateTask onCancel={ () => setShowTaskInput(false) } />
            ) : (
              <Button
                onClick={ () => setShowTaskInput((prev) => !prev) }
                className='fixed bottom-6 right-4 shadow-lg dark:shadow shadow-primary/65 dark:shadow-primary/35'
              >
                <Plus />
                <span className='max-md:hidden'>New Task</span>
              </Button>
            ) }
          </div>
        </div>
      ) }
    </main>
  );
}
