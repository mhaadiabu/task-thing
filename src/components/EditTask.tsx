import { useState } from "react";
import { Check, X } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { ACTIONS } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ButtonGroup } from "./ui/button-group";

interface EditTaskProps {
  id: string;
  task: string;
}

const EditTask = ({ id, task }: EditTaskProps) => {
  const [editedTask, setEditedTask] = useState(task);
  const { dispatch, setIsEditing } = useTaskContext();

  const editTask = () => {
    dispatch({
      type: ACTIONS.EDIT_TASK,
      payload: { id: id, task: editedTask.trim() },
    });

    setIsEditing(null);
  };

  return (
    <div className="flex gap-2 justify-between items-center w-full mx-auto">
      <div className="flex gap-2 items-center justify-start w-full">
        <Input
          type="text"
          name="edit-task"
          value={editedTask}
          onChange={(e) => setEditedTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              editTask();
            } else if (e.key === "Escape") {
              setIsEditing(null);
            }
          }}
          autoFocus
        />
      </div>

      <ButtonGroup>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setIsEditing(null)}
        >
          <X />
        </Button>
        <Button size="icon" onClick={editTask}>
          <Check />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default EditTask;
