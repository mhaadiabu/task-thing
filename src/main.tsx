import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter } from './router';
import { RouterProvider } from '@tanstack/react-router';
import './index.css';

// Import the generated route tree
// import { routeTree } from './routeTree.gen';

// Create a new router instance
// const router = createRouter({ routeTree });

// // Register the router instance for type safety
// declare module '@tanstack/react-router' {
//   interface Register {
//     router: typeof router;
//   }
// }

const router = createRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
