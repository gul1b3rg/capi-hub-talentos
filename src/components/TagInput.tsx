import { useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ value, onChange, placeholder = 'Escribe y presiona Enter' }: TagInputProps) => {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return;
    const exists = value.some((existing) => existing.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      setInput('');
      return;
    }
    onChange([...value, normalized]);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(input);
    } else if (event.key === 'Backspace' && !input.length && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-secondary/20 px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary"
          >
            {tag}
            <button
              type="button"
              className="text-secondary/70 hover:text-secondary"
              onClick={() => removeTag(tag)}
              aria-label={`Eliminar ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] bg-transparent px-2 py-1 text-sm text-secondary outline-none"
          placeholder={placeholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <p className="mt-1 text-xs text-secondary/60">Presiona Enter para agregar cada etiqueta.</p>
    </div>
  );
};

export default TagInput;
