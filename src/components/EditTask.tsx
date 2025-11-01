import { useContext, useState } from "react";
import { Check, X } from "lucide-react";
import { TaskContext } from "@/context/TaskContext";
import { ACTIONS } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ButtonGroup } from "./ui/button-group";

interface TaskProps {
  id: string;
  task: string;
}

const EditTask = ({ id, task }: TaskProps) => {
  const [editedTask, setEditedTask] = useState(task);

  const context = useContext(TaskContext);

  const { dispatch, setIsEditing } = context!;

  const editTask = () => {
    dispatch({
      type: ACTIONS.EDIT_TASK,
      payload: { id: id, task: editedTask },
    });

    setIsEditing(null);
  };

  return (
    <div className="flex gap-2 justify-between items-center w-full mx-auto">
      <div className="flex gap-2 items-center justify-start w-full">
        <Input
          type="text"
          value={editedTask}
          onChange={(e) => setEditedTask(e.target.value)}
          onBlur={editTask}
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
        <Button variant="success" size="icon" onClick={editTask}>
          <Check />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default EditTask;
