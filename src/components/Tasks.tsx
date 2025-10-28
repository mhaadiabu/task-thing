import { useContext } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { TaskContext } from "@/context/TaskContext";
import { ACTIONS, cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface TaskProps {
  id: string;
  task: string;
  status: "pending" | "completed";
  className?: string;
}

const Tasks = ({ id, task, status, className }: TaskProps) => {
  const context = useContext(TaskContext);

  const { dispatch, setIsEditing } = context!;

  return (
    <div className={cn("flex gap-2 justify-between items-center", className)}>
      <div className="flex gap-2 items-center justify-start">
        <Checkbox
          id={`task-${id}`}
          checked={status === "completed" ? true : false}
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
          )}
        >
          {task}
        </Label>
      </div>

      <div className="flex gap-2 items-center justify-end">
        <Button size="icon" onClick={() => setIsEditing(true)}>
          <Edit3 />
        </Button>
        <Button
          size="icon"
          onClick={() =>
            dispatch({
              type: ACTIONS.DELETE_TASK,
              payload: { id: id },
            })
          }
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};

export default Tasks;
