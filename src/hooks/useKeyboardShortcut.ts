import { useEffect, useCallback } from "react";

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
  shift?: boolean;
};

interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  combo: KeyCombo,
  callback: () => void,
  options: UseKeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();
      const ctrlMatch = combo.ctrl !== undefined ? e.ctrlKey === combo.ctrl : true;
      const altMatch = combo.alt !== undefined ? e.altKey === combo.alt : true;
      const metaMatch = combo.meta !== undefined ? e.metaKey === combo.meta : true;
      const shiftMatch = combo.shift !== undefined ? e.shiftKey === combo.shift : true;

      if (keyMatch && ctrlMatch && altMatch && metaMatch && shiftMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        callback();
      }
    },
    [combo, callback, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}
