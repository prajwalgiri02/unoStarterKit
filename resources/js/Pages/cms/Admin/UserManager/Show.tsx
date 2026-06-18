import { Form, Link, usePage } from '@inertiajs/react'

import AdminLayout from '@/layouts/AdminLayout'
import Button from '@/components/Form/Button'

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

type PageProps = {
  user: ManagedUser
  flash: {
    status?: string
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}

export default function UserManagerShow() {
  const { user, flash } = usePage<PageProps>().props

  return (
    <AdminLayout headerLabel={user.name} backUrl="/cms/user-manager">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <Link
          href="/cms/user-manager"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Back to users
        </Link>
      </div>

      {flash.status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {flash.status}
        </div>
      )}

      <div className="mb-6 space-y-3 rounded-xl border border-gray-200 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Roles</span>
          <span className="font-medium text-gray-900">
            {user.roles.length > 0 ? user.roles.join(', ') : 'None'}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Status</span>
          <span className="font-medium text-gray-900">
            {user.is_blocked ? 'Blocked' : 'Active'}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Approval</span>
          <span className="font-medium text-gray-900">
            {user.is_approved ? 'Approved' : 'Pending approval'}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Approved at</span>
          <span className="font-medium text-gray-900">{formatDate(user.approved_at)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Blocked at</span>
          <span className="font-medium text-gray-900">{formatDate(user.blocked_at)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Created</span>
          <span className="font-medium text-gray-900">{formatDate(user.created_at)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Updated</span>
          <span className="font-medium text-gray-900">{formatDate(user.updated_at)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cms/user-manager/${user.id}/edit`}
          className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit user
        </Link>

        <Form action={`/cms/user-manager/${user.id}/toggle-block`} method="post">
          {({ processing }) => (
            <Button type="submit" loading={processing} loadingText="Updating...">
              {user.is_blocked ? 'Unblock user' : 'Block user'}
            </Button>
          )}
        </Form>

        <Form action={`/cms/user-manager/${user.id}`} method="delete">
          {({ processing }) => (
            <Button
              type="submit"
              variant="danger"
              loading={processing}
              loadingText="Deleting..."
            >
              Delete user
            </Button>
          )}
        </Form>
      </div>
    </AdminLayout>
  )
}
