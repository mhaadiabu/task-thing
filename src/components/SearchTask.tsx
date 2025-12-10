import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Activity } from "react";
import { useEffect, useRef, useState } from "react";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const SearchTask = ({ value, onChange, onClear }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect Mac OS using userAgent as navigator.platform is deprecated
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  // Cmd/Ctrl + K to focus search
  useKeyboardShortcut({ key: "k", ctrl: true }, () => {
    inputRef.current?.focus();
  });

  useKeyboardShortcut({ key: "k", meta: true }, () => {
    inputRef.current?.focus();
  });

  return (
    <div
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm flex gap-2 items-center",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
      )}
    >
      <Search size={16} />
      <input
        ref={inputRef}
        type="text"
        name="search"
        placeholder="Search task"
        value={value}
        onChange={onChange}
        className="border-none outline-none w-full h-full"
      />

      <kbd className="pointer-events-none text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono hidden sm:flex">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>

      <Activity mode={value.length < 1 ? "hidden" : "visible"}>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onClear}
          className="p-px"
        >
          <X />
        </Button>
      </Activity>
    </div>
  );
};

export default SearchTask;
