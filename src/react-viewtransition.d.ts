import * as React from 'react';

declare module 'react' {
  export interface ViewTransitionProps {
    name?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    update?: string | Record<string, string>;
    share?: string | Record<string, string>;
    default?: string | Record<string, string>;
    children?: React.ReactNode;
    onEnter?: (element: Element, types: string[]) => void;
    onExit?: (element: Element, types: string[]) => void;
    onShare?: (element: Element, types: string[]) => void;
    onUpdate?: (element: Element, types: string[]) => void;
  }

  export const ViewTransition: React.ComponentType<ViewTransitionProps>;
  export function addTransitionType(type: string): void;
}
