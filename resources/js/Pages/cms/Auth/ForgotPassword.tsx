import { Form, Link } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Input from '@/Components/Form/Input'
import Button from '@/Components/Form/Button'

type ForgotPasswordProps = {
  status?: string
  error?: string
}

export default function ForgotPassword({ status, error }: ForgotPasswordProps) {
  return (
    <AuthLayout>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Forgot your password?
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Enter your email address and we will send a verification code if an
        account exists.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {status}
        </div>
      )}

      <Form action="/cms/forgot-password" method="post">
        {({ errors, processing }) => (
          <div className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              autoFocus
              required
            />

            <Button
              type="submit"
              loading={processing}
              loadingText="Sending code..."
              fullWidth
            >
              Send verification code
            </Button>
          </div>
        )}
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{' '}
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
