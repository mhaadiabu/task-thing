import { Edit3, Trash2 } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { ACTIONS, cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

interface TasksProps {
  id: string;
  task: string;
  status: "pending" | "completed";
  className?: string;
}

const Tasks = ({ id, task, status, className }: TasksProps) => {
  const { dispatch, setIsEditing } = useTaskContext();

  return (
    <div className={cn("flex gap-2 justify-between items-center", className)}>
      <div className="flex gap-2 items-center justify-start">
        <Checkbox
          id={`task-${id}`}
          checked={status === "completed"}
          onCheckedChange={() =>
            dispatch({
              type: ACTIONS.UPDATE_TASK,
              payload: { id: id },
            })
          }
        />
        <Label
          htmlFor={`task-${id}`}
          className={cn(
            status === "completed"
              ? "line-through text-muted-foreground"
              : "no-underline",
            "word-wrap",
          )}
        >
          {task}
        </Label>
      </div>

      <ButtonGroup>
        <Button size="icon" onClick={() => setIsEditing(id)}>
          <Edit3 />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() =>
            dispatch({
              type: ACTIONS.DELETE_TASK,
              payload: { id: id },
            })
          }
        >
          <Trash2 />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default Tasks;
