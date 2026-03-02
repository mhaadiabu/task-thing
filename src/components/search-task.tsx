import { Search, X } from 'lucide-react';
import { useRef } from 'react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

import { Button } from './ui/button';

export const SearchTask = ({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K to focus search
  useKeyboardShortcut({ key: 'k', ctrl: true }, () => {
    inputRef.current?.focus();
  });

  return (
    <div className='sticky top-0 z-10 w-full'>
      <InputGroup>
        <InputGroupInput
          placeholder='Search task'
          value={value}
          onChange={onChange}
          ref={inputRef}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align='inline-end'>
          {value.length > 0 ? (
            <Button size='icon-sm' variant='ghost' onClick={onClear} className='p-px'>
              <X />
            </Button>
          ) : (
            <>
              <Kbd>Ctrl</Kbd>
              {'+'}
              <Kbd>K</Kbd>
            </>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
