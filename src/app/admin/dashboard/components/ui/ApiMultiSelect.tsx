// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\components\ui\ApiMultiSelect.tsx

import { useState, useEffect, useMemo, useCallback } from "react";

interface Option {
  id: string;
  name: string;
}

interface ApiMultiSelectProps {
  label: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  fetchOptions: (search: string) => Promise<Option[]>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ApiMultiSelect({
  label,
  selected,
  onChange,
  fetchOptions,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
}: ApiMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allOptions, setAllOptions] = useState<Option[]>([]);

  // Load options on mount and when search changes
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoading(true);
      try {
        const results = await fetchOptions(search);
        setOptions(results);
        if (search === "") {
          setAllOptions(results);
        }
      } catch (error) {
        console.error("Failed to load options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [fetchOptions, search]);

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const removeTag = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(id => id !== optionId));
  };

  const selectAll = () => {
    if (selected.length === options.length && options.length > 0) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.id));
    }
  };

  const getSelectedOptionNames = () => {
    return selected.map(id => {
      const option = allOptions.find(opt => opt.id === id);
      return option ? option.name : id;
    });
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`w-full rounded-lg border px-4 py-3 cursor-pointer flex flex-wrap gap-2 min-h-[3rem] items-center ${
          error ? "border-red-500" : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-50 dark:bg-gray-700"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        {selected.map((id, index) => {
          const name = getSelectedOptionNames()[index];
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-sm"
            >
              {name}
              <button
                type="button"
                onClick={(e) => removeTag(id, e)}
                className="hover:text-purple-900 dark:hover:text-purple-200"
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="p-2">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                </div>
              ) : (
                <>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer border-b mb-2 dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={selected.length === options.length && options.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      ({selected.length}/{options.length})
                    </span>
                  </label>

                  <div className="space-y-1">
                    {options.length > 0 ? (
                      options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(option.id)}
                            onChange={() => toggleOption(option.id)}
                            className="w-4 h-4 accent-purple-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No options found</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}