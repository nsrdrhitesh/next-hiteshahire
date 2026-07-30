export default function StatsCards() {
  const stats = [
    {
      title: "Total Users",
      value: "25,483",
      change: "+12.5%",
      icon: (
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.623a10 10 0 01-.671.819 8 8 0 01-2.915 1.755 6 6 0 01-3.826.201 4 4 0 01-2.577-1.302 2 2 0 01-.75-1.2" />
        </svg>
      ),
      color: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
    {
      title: "Active Matches",
      value: "1,247",
      change: "+8.2%",
      icon: (
        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    },
    {
      title: "Revenue",
      value: "$45.2K",
      change: "+24.7%",
      icon: (
        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+3.1%",
      icon: (
        <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`rounded-xl ${stat.color} p-6 shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{stat.change}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">from last month</span>
              </div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}