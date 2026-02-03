import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export const SearchTask = ({ value, onChange, onClear }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K to focus search
  useKeyboardShortcut({ key: '/' }, () => {
    inputRef.current?.focus();
  });

  return (
    <div className='w-full'>
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
          <Kbd>/</Kbd>
          {value.length > 0 && (
            <Button
              size='icon-sm'
              variant='ghost'
              onClick={onClear}
              className='p-px'
            >
              <X />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
