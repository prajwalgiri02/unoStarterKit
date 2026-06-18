import { Form, Link, usePage } from '@inertiajs/react'

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
}

type PageProps = {
  user: ManagedUser
}

export default function UserManagerEdit() {
  const { user } = usePage<PageProps>().props

  return (
    <AdminLayout headerLabel="Edit User" backUrl={`/cms/user-manager/${user.id}`}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit user</h2>
          <p className="text-sm text-gray-500">Update account details for {user.email}.</p>
        </div>

        <Link
          href={`/cms/user-manager/${user.id}`}
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Back to user
        </Link>
      </div>

      <Form
        action={`/cms/user-manager/${user.id}`}
        method="put"
        resetOnSuccess={['password', 'password_confirmation']}
      >
        {({ errors, processing }) => (
          <div className="space-y-4">
            <Input
              name="name"
              label="Full name"
              defaultValue={user.name}
              error={errors.name}
              required
            />

            <Input
              name="email"
              type="email"
              label="Email"
              defaultValue={user.email}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                name="password"
                type="password"
                label="New password"
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
                error={errors.password}
              />

              <Input
                name="password_confirmation"
                type="password"
                label="Confirm new password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={errors.password_confirmation}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={processing} loadingText="Saving...">
                Save changes
              </Button>

              <Link
                href={`/cms/user-manager/${user.id}`}
                className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}
      </Form>
    </AdminLayout>
  )
}
