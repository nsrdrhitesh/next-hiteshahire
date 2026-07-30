"use client";

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export default function BlogFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: BlogFiltersProps) {
  const categories = [
    "all",
    "Technology",
    "Lifestyle",
    "Relationship",
    "Culture",
    "Finance",
    "Safety",
    "Success Stories",
  ];

  const statuses = [
    { value: "all", label: "All Status", color: "gray" },
    { value: "published", label: "Published", color: "green" },
    { value: "draft", label: "Draft", color: "yellow" },
    { value: "archived", label: "Archived", color: "red" },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Blogs
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or author..."
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="flex gap-2">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status.value
                    ? `bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900 dark:text-${status.color}-300`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Date
          </div>
        </button>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Sort by Popularity
          </div>
        </button>
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Bulk Actions
          </div>
        </button>
      </div>
    </div>
  );
}