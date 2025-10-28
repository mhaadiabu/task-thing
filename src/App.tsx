import { useContext } from "react";
import { TaskContext } from "@/context/TaskContext";
import Tasks from "./components/Tasks";
import CreateTask from "./components/CreateTask";
import EditTask from "./components/EditTask";

const App = () => {
  const context = useContext(TaskContext);

  if (!context) return;

  const { tasks, isEditing } = context;

  console.log(tasks);

  return (
    <main className="bg-background text-foreground font-medium w-full min-h-svh px-4 py-7 font-mono dark">
      <div className="flex flex-col max-w-5xl mx-auto py-4 sm:py-6">
        <CreateTask />

        <div className="flex flex-col gap-2.5 mt-4 w-full">
          {tasks.map(({ id, task, status }) =>
            isEditing ? (
              <EditTask key={id} id={id} task={task} />
            ) : (
              <Tasks
                key={id}
                id={id}
                task={task}
                status={status}
                className="not-last:border-b pb-2.5"
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
};

export default App;
