export default function ActivityChart() {
  const activities = [
    { month: "Jan", users: 4000, matches: 2400 },
    { month: "Feb", users: 3000, matches: 1398 },
    { month: "Mar", users: 2000, matches: 9800 },
    { month: "Apr", users: 2780, matches: 3908 },
    { month: "May", users: 1890, matches: 4800 },
    { month: "Jun", users: 2390, matches: 3800 },
    { month: "Jul", users: 3490, matches: 4300 },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Overview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly user growth and matches</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Matches</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        {/* Simple bar chart representation */}
        <div className="flex h-full items-end justify-between pt-8">
          {activities.map((activity, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="relative flex h-48 w-12 items-end">
                <div
                  className="w-5 rounded-t-lg bg-blue-500 opacity-90"
                  style={{ height: `${(activity.users / 5000) * 100}%` }}
                />
                <div
                  className="absolute bottom-0 w-5 rounded-t-lg bg-purple-500 opacity-90"
                  style={{ height: `${(activity.matches / 10000) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{activity.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}