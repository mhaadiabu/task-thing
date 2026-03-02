import { queryClient, api } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useRef, useState, ViewTransition } from "react";
import { tryCatch } from "../lib/utils/try-catch";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Textarea } from "./ui/textarea";
import type { Task } from "@/types/task";

type Tasks = Omit<Task, "updatedAt">;

export const NewTask = ({
  addOptimisticTask,
  onCancel,
  userId,
}: {
  addOptimisticTask: (action: Tasks) => void;
  onCancel: () => void;
  userId: string;
}) => {
  const [task, setTask] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryKey = api.getTasks.queryKey({ userId });

  const newTask = useMutation(
    api.createTask.mutationOptions({
      onMutate: () => {
        const op: Tasks = {
          id: crypto.randomUUID(),
          task: task,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          userId: userId
        }

        addOptimisticTask(op)
      },
      // onError: (error) => {
      //   toast.error(error)
      // },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const createTask = async () => {
    if (task.length < 1) {
      if (inputRef.current) {
        inputRef.current.setAttribute("aria-invalid", "true");
      }
      return;
    }

    const trimmed = task.trim();

    const { error } = await tryCatch(newTask.mutateAsync({ userId, task: trimmed }));
    if (error) window.alert(error);

    setTask("");
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
    if (e.target.value.length > 0 && inputRef.current) {
      inputRef.current.setAttribute("aria-invalid", "false");
    }
  };

  return (
    <ViewTransition enter="slide-up" exit="slide-down" update="slide-down">
      <div className="flex flex-col w-full mx-auto py-2 gap-2.5 items-end">
        <Textarea
          ref={inputRef}
          name="task"
          value={task}
          placeholder="Add a new task..."
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              createTask();
            }
          }}
          aria-invalid="false"
          rows={1}
          autoFocus
        />
        <ButtonGroup>
          <Button variant="destructive" onClick={onCancel}>
            <X />
            <span className="max-md:hidden">Cancel</span>
          </Button>

          <Button onClick={createTask}>
            <span className="max-md:hidden">Click to Add</span>
            <Plus />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
