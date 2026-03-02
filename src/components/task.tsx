import { useTaskContext } from "@/context/TaskContext";
import { cn } from "@/lib/utils";
import { queryClient, api } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Edit3, Trash2 } from "lucide-react";
import { startTransition, ViewTransition } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type TaskRow = {
  userId: string;
  task: string;
  id: string;
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
};
type TasksData = TaskRow[] | undefined;

export const Task = ({
  id,
  userId,
  task,
  status,
}: {
  id: string;
  userId: string;
  task: string;
  status: "pending" | "completed";
  className?: string;
}) => {
  const { setIsEditing } = useTaskContext();
  const queryKey = api.getTasks.queryKey({ userId });

  const toggleStatus = useMutation(
    api.updateTask.mutationOptions({
      onMutate: async ({ status: newStatus }) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: TasksData) =>
          old?.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
        );
        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const deleteTask = useMutation(
    api.deleteTask.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old: TasksData) => old?.filter((t) => t.id !== id));
        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const handleToggle = () => {
    const newStatus = status === "pending" ? "completed" : "pending";
    startTransition(() => {
      toggleStatus.mutate({ id, status: newStatus });
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteTask.mutate({ id });
    });
  };

  const handleEdit = () => {
    startTransition(() => setIsEditing(id));
  };

  return (
    <ViewTransition enter="slide-up" exit="scale-down">
      <div className="flex gap-2 items-center justify-between w-full py-2">
        <div className="flex gap-2 items-start">
          <Checkbox
            id={`task-${id}`}
            checked={status === "completed"}
            onCheckedChange={handleToggle}
          />
          <Label
            htmlFor={`task-${id}`}
            className={cn(
              status === "completed" ? "line-through text-muted-foreground" : "no-underline",
              "word-wrap whitespace-pre-wrap",
            )}
          >
            {task}
          </Label>
        </div>

        <ButtonGroup>
          <Button size="icon" onClick={handleEdit}>
            <Edit3 />
          </Button>
          <Button size="icon" variant="destructive" onClick={handleDelete}>
            <Trash2 />
          </Button>
        </ButtonGroup>
      </div>
    </ViewTransition>
  );
};
