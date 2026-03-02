import { Spinner } from './ui/spinner';

export const LoadingScreen = () => {
  return (
    <div className='top-0 right-0 bottom-0 left-0 flex h-screen w-screen items-center justify-center'>
      <Spinner className='size-9' />
    </div>
  );
};
