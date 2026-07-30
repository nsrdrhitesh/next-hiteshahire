"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface Option {
  id: string;
  name: string;
  code?: string;
  isGroup?: boolean;
  groupName?: string;
}

interface FetchOptionsResult {
  data: Option[];
  meta?: {
    hasNextPage: boolean;
    total: number;
  };
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string, option: Option | null) => void;
  fetchOptions: (search: string, page: number) => Promise<FetchOptionsResult>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  helperText?: React.ReactNode;
  
  // NEW: Optional prop for edit mode (shows name immediately without fetching)
  initialLabel?: string;
}

const DEBOUNCE_DELAY = 350;

export default function SearchableSelect({
  label,
  value,
  onChange,
  fetchOptions,
  placeholder = "Select an option...",
  required = false,
  error,
  disabled = false,
  className = "",
  initialLabel,          // ← New prop
}: SearchableSelectProps) {
  
  const [initialValueSet, setInitialValueSet] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync selected option when value becomes empty
  useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      setInitialValueSet(false);
    }
  }, [value]);

  // Handle initialLabel for edit mode (especially useful for Birth Place)
  useEffect(() => {
    if (!value || selectedOption || initialValueSet) return;

    // Priority 1: Use initialLabel if provided (from formData.birthPlaceName)
    if (initialLabel && initialLabel.trim() !== "") {
      setSelectedOption({
        id: value,
        name: initialLabel.trim(),
      });
      setInitialValueSet(true);
      return;
    }

    // Priority 2: Check if already in current options list
    const found = options.find(o => o.id === value);
    if (found) {
      setSelectedOption(found);
      setInitialValueSet(true);
      return;
    }

    // Priority 3: Try to fetch once to resolve the label
    let ignore = false;

    const tryFetch = async () => {
      try {
        const result = await fetchOptions("", 1);
        if (ignore) return;

        const match = result.data.find(o => o.id === value);

        if (match) {
          setSelectedOption(match);
          setOptions(prev =>
            prev.some(p => p.id === match.id) ? prev : [match, ...prev]
          );
          setInitialValueSet(true);
        }
      } catch (err) {
        console.warn("Failed to resolve initial label:", err);
      }
    };

    tryFetch();

    return () => {
      ignore = true;
    };
  }, [value, initialLabel, selectedOption, initialValueSet, options, fetchOptions]);

  // Load options when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await fetchOptions(search.trim(), 1);
        setOptions(result.data || []);
        setHasMore(result.meta?.hasNextPage || false);
        setPage(1);
      } catch (err) {
        console.warn("Failed to load options:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search, isOpen, fetchOptions]);

  // Infinite scroll
  const loadMoreOptions = useCallback(async () => {
    if (loading || !hasMore || !isOpen) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const result = await fetchOptions(search.trim(), nextPage);
      setOptions((prev) => [...prev, ...(result.data || [])]);
      setPage(nextPage);
      setHasMore(result.meta?.hasNextPage || false);
    } catch (err) {
      console.warn("Failed to load more:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, isOpen, page, search, fetchOptions]);

  useEffect(() => {
    if (!isOpen || !loadMoreRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMoreOptions(),
      { rootMargin: "200px" }
    );
    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [isOpen, loadMoreOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    if (option.isGroup) return;

    setSelectedOption(option);
    onChange(option.id, option);
    setIsOpen(false);
    setSearch("");
    setInitialValueSet(true);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    onChange("", null);
    setSearch("");
    setInitialValueSet(false);
  };

  // Display text: prioritize selectedOption, then initialLabel (for edit mode)
  const displayText = selectedOption?.name || initialLabel || "";

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between w-full px-4 py-3 rounded-2xl border cursor-pointer
          bg-white dark:bg-gray-800 transition-all
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600 hover:border-purple-400"}
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <span className={`truncate flex-1 ${displayText ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          {displayText || placeholder}
        </span>

        <div className="flex items-center gap-1.5">
          {selectedOption && !disabled && (
            <button onClick={handleClear} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={16} className="text-gray-500" />
            </button>
          )}
          <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[420px] flex flex-col">
          {/* Search Box */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto max-h-[340px]">
            {loading && options.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : options.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No results found</div>
            ) : (
              options.map((option, index) => {
                if (option.isGroup) {
                  return (
                    <div
                      key={`group-${index}`}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700"
                    >
                      {option.name}
                    </div>
                  );
                }

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-5 py-3.5 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors
                      ${selectedOption?.id === option.id ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200" : "text-gray-800 dark:text-gray-100"}
                    `}
                  >
                    {option.name}
                  </div>
                );
              })
            )}

            {hasMore && (
              <div ref={loadMoreRef} className="py-4 text-center text-sm text-gray-500">
                {loading ? "Loading more..." : "Scroll for more"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}