import { Form, Link, router, usePage } from '@inertiajs/react'

import AdminLayout from '@/layouts/AdminLayout'
import Button from '@/components/Form/Button'
import Input from '@/components/Form/Input'

type ManagedUser = {
  id: number
  name: string
  email: string
  roles: string[]
  is_blocked: boolean
  is_approved: boolean
  approved_at: string | null
  blocked_at: string | null
  created_at: string | null
  updated_at: string | null
}

type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

type PaginatedUsers = {
  data: ManagedUser[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: PaginationLink[]
}

type PageProps = {
  users: PaginatedUsers
  filters: {
    search: string
  }
  flash: {
    status?: string
  }
}

export default function UserManagerIndex() {
  const { users, filters, flash } = usePage<PageProps>().props

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const search = String(formData.get('search') ?? '')

    router.get('/cms/user-manager', { search }, { preserveState: true })
  }

  return (
    <AdminLayout headerLabel="User Manager" showSearchBar>
      {flash.status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {flash.status}
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          name="search"
          label="Search users"
          placeholder="Search by name or email"
          defaultValue={filters.search}
          containerClassName="flex-1"
        />

        <div className="flex items-end gap-2">
          <Button type="submit">Search</Button>

          {filters.search && (
            <Link
              href="/cms/user-manager"
              className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {users.data.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.data.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.is_blocked ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Blocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      )}

                      {!user.is_approved && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Pending approval
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/cms/user-manager/${user.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        View
                      </Link>
                      <Link
                        href={`/cms/user-manager/${user.id}/edit`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.last_page > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {users.links.map((link) =>
            link.url ? (
              <Link
                key={link.label}
                href={link.url}
                className={[
                  'rounded-lg border px-3 py-1 text-sm',
                  link.active
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50',
                ].join(' ')}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ) : (
              <span
                key={link.label}
                className="rounded-lg border border-gray-100 px-3 py-1 text-sm text-gray-400"
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ),
          )}
        </div>
      )}
    </AdminLayout>
  )
}
