import AdminLayout from '@/layouts/AdminLayout'

export default function Dashboard() {
  return (
    <AdminLayout headerLabel="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back, Admin!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">56</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$12,345</p>
        </div>
      </div>
    </AdminLayout>
  )
}
