export default function QuickActions() {
  const actions = [
    {
      title: "Add New User",
      description: "Create a new user account manually",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Verify Profile",
      description: "Review and verify pending profiles",
      icon: (
        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Send Notification",
      description: "Send broadcast to all users",
      icon: (
        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Generate Report",
      description: "Create monthly performance report",
      icon: (
        <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex items-start gap-4 rounded-lg ${action.color} p-4 text-left transition-all hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700">{action.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </div>
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}