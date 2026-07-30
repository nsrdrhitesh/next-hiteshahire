import StatsCards from "./components/StatsCards";
import ActivityChart from "./components/ActivityChart";
import RecentUsers from "./components/RecentUsers";
import QuickActions from "./components/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back staging! Here&apos;s what&apos;s happening with your platform today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts and Recent Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityChart />
        <QuickActions />
      </div>

      {/* Recent Users Table */}
      <RecentUsers />

      {/* Additional Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 p-6 text-white">
          <h3 className="text-lg font-semibold">System Health</h3>
          <p className="mt-2 text-sm opacity-90">All systems operational</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-white/30">
              <div className="h-full w-4/5 rounded-full bg-white"></div>
            </div>
            <span className="text-sm">80%</span>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 p-6 text-white">
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="mt-2 text-3xl font-bold">1,247</p>
          <p className="mt-2 text-sm opacity-90">Users online right now</p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 p-6 text-white">
          <h3 className="text-lg font-semibold">Support Tickets</h3>
          <p className="mt-2 text-3xl font-bold">24</p>
          <p className="mt-2 text-sm opacity-90">Pending resolution</p>
        </div>
      </div>
    </div>
  );
}