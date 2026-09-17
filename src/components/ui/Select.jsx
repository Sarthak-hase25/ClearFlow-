import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Select — a fully custom styled dropdown replacing native <select>.
 *
 * Props:
 *   value        — current selected value (string)
 *   onChange     — called with the new value string
 *   options      — array of { value, label } objects  OR  array of strings
 *   placeholder  — placeholder text shown when no value selected
 *   size         — 'sm' | 'md' (default 'md')
 *   className    — extra classes on the wrapper div
 *   disabled     — disables the control
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  size = 'md',
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label } shape
  const normalized = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selected = normalized.find(o => o.value === value) || null;

  const toggle = () => { if (!disabled) setOpen(v => !v); };

  const pick = useCallback((val) => {
    onChange?.(val);
    setOpen(false);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = normalized.findIndex(o => o.value === value);
      if (idx < normalized.length - 1) pick(normalized[idx + 1].value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = normalized.findIndex(o => o.value === value);
      if (idx > 0) pick(normalized[idx - 1].value);
    }
  };

  const isSm = size === 'sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'w-full flex items-center justify-between gap-2 text-left',
          'border rounded-lg bg-white font-medium',
          'transition-all duration-150 cursor-pointer select-none outline-none',
          'focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:border-blue-500',
          open
            ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 shadow-sm',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          isSm
            ? 'px-2.5 py-1.5 text-xs'
            : 'px-3.5 py-2 text-sm',
        ].join(' ')}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={[
            'flex-shrink-0 text-gray-400 transition-transform duration-200',
            isSm ? 'w-3.5 h-3.5' : 'w-4 h-4',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className={[
            'absolute z-50 mt-1.5 w-full min-w-[10rem]',
            'bg-white border border-gray-200 rounded-xl shadow-xl',
            'py-1 overflow-y-auto',
          ].join(' ')}
          style={{ maxHeight: '16rem' }}
        >
          {normalized.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => pick(opt.value)}
                className={[
                  'w-full flex items-center justify-between px-3.5 py-2 text-left',
                  'transition-colors duration-100 cursor-pointer',
                  isSm ? 'text-xs' : 'text-sm',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 font-medium',
                ].join(' ')}
              >
                <span>{opt.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
