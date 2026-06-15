import { Form, Link } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Input from '@/Components/Form/Input'
import Button from '@/Components/Form/Button'

type ResetPasswordProps = {
  token: string
  status?: string
}

export default function ResetPassword({ token, status }: ResetPasswordProps) {
  return (
    <AuthLayout>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Create new password
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Choose a strong password for your account.
      </p>

      {status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {status}
        </div>
      )}

      <Form
        action={`/cms/reset-password/${token}`}
        method="post"
        resetOnSuccess={['password', 'password_confirmation']}
      >
        {({ errors, processing }) => (
          <div className="space-y-4">
            <Input
              name="password"
              type="password"
              label="New password"
              placeholder="Enter your new password"
              autoComplete="new-password"
              error={errors.password}
              autoFocus
              required
            />

            <Input
              name="password_confirmation"
              type="password"
              label="Confirm password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              error={errors.password_confirmation}
              required
            />

            <Button
              type="submit"
              loading={processing}
              loadingText="Saving password..."
              fullWidth
            >
              Reset password
            </Button>
          </div>
        )}
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/cms/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
