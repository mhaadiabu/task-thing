import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import TaskProvider from './components/TaskProvider';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<TaskProvider>
			<App />
		</TaskProvider>
	</StrictMode>
);
