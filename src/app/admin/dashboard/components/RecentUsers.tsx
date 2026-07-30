export default function RecentUsers() {
  const users = [
    {
      name: "Alex Johnson",
      email: "alex@example.com",
      status: "Verified",
      plan: "Premium",
      joined: "2024-01-15",
      avatar: "AJ",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    {
      name: "Sarah Williams",
      email: "sarah@example.com",
      status: "Pending",
      plan: "Basic",
      joined: "2024-01-14",
      avatar: "SW",
      statusColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    {
      name: "Michael Chen",
      email: "michael@example.com",
      status: "Verified",
      plan: "Premium",
      joined: "2024-01-13",
      avatar: "MC",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    {
      name: "Emma Davis",
      email: "emma@example.com",
      status: "Blocked",
      plan: "Basic",
      joined: "2024-01-12",
      avatar: "ED",
      statusColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    {
      name: "David Wilson",
      email: "david@example.com",
      status: "Verified",
      plan: "Gold",
      joined: "2024-01-11",
      avatar: "DW",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  ];

  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Latest user registrations</p>
          </div>
          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
            View all
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Joined Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-medium text-white">
                        {user.avatar}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.statusColor}`}>
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    user.plan === "Premium" || user.plan === "Gold"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {user.plan}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {user.joined}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                      View
                    </button>
                    <button className="rounded-lg bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}