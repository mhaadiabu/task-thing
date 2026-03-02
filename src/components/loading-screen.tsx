import { Spinner } from "./ui/spinner";

export const LoadingScreen = () => {
  return (
    <div className="h-screen w-screen top-0 left-0 right-0 bottom-0 flex justify-center items-center">
      <Spinner className="size-9" />
    </div>
  );
};
