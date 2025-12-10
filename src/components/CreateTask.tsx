import { useTaskContext } from "@/context/TaskContext";
import { ACTIONS } from "@/lib/utils";
import { useState, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";

interface CreateTaskProps {
  onCancel: () => void;
}

const CreateTask = ({ onCancel }: CreateTaskProps) => {
  const [taskItem, setTaskItem] = useState("");
  const { dispatch } = useTaskContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const createTask = () => {
    if (taskItem.length < 1) {
      if (inputRef.current) {
        inputRef.current.setAttribute("aria-invalid", "true");
      }
      return;
    }

    dispatch({
      type: ACTIONS.CREATE_TASK,
      payload: { task: taskItem.trim() },
    });

    setTaskItem("");

    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskItem(e.target.value);
    if (e.target.value.length > 0 && inputRef.current) {
      inputRef.current.setAttribute("aria-invalid", "false");
    }
  };

  return (
    <div className="flex flex-col w-full mx-auto py-2 gap-2.5 items-end">
      <Input
        ref={inputRef}
        type="text"
        name="task"
        value={taskItem}
        placeholder="Add a new task..."
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && createTask()}
        aria-invalid="false"
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
  );
};

export default CreateTask;
