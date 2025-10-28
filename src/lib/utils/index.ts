import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import reducer, { ACTIONS, type ActionTypes, type TaskTypes } from "./reducer";
import { auth } from "./auth";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { cn, reducer, ACTIONS, auth };
export type { TaskTypes, ActionTypes };
