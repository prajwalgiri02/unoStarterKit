import { Form, Link, usePage } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Button from '@/Components/Form/Button'

type PendingUser = {
  id: number
  name: string
  email: string
  created_at: string | null
}

type PageProps = {
  users: PendingUser[]
  flash: {
    status?: string
  }
}

export default function PendingUsers() {
  const { users, flash } = usePage<PageProps>().props

  return (
    <AuthLayout>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Pending user approvals
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Review and approve new accounts before they can sign in.
      </p>

      {flash.status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {flash.status}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No users are waiting for approval.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <Form action={`/cms/admin/users/${user.id}/approve`} method="post">
                {({ processing }) => (
                  <Button type="submit" loading={processing} loadingText="Approving...">
                    Approve
                  </Button>
                )}
              </Form>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/" className="font-medium text-gray-900 hover:underline">
          Back to home
        </Link>
      </p>
    </AuthLayout>
  )
}
