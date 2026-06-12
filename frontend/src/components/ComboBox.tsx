import React, { useState, useEffect, useRef } from "react";

interface ComboBoxProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ComboBox({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input value
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const selectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    // Focus back on the input so navigation keys still work
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === "Enter") {
      // If the dropdown is open and an item is highlighted, select it
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        e.stopPropagation(); // Prevents form focus-shifting or submit
        selectOption(filteredOptions[highlightedIndex]);
      } else {
        // Otherwise, close the dropdown but allow enter key to shift focus (letting it propagate)
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={handleFocus}
        onClick={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 divide-y divide-slate-100">
          {filteredOptions.map((opt, idx) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents input losing focus
                selectOption(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`p-2 cursor-pointer text-sm transition-colors ${
                idx === highlightedIndex
                  ? "bg-indigo-600 text-white font-medium"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
