import { Form, usePage, Link } from '@inertiajs/react'

import Button from '@/Components/Form/Button'

type AuthUser = {
  id: number
  name: string
  email: string
}

type WelcomePageProps = {
  auth: {
    user: AuthUser | null
  }
}

export default function Welcome() {
  const { auth } = usePage<WelcomePageProps>().props
  const user = auth.user

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Welcome to laravelBase
        </h1>

        {user ? (
          <div className="mt-6 space-y-4">
            <p className="text-center text-sm text-gray-600">
              Signed in as{' '}
              <span className="font-medium text-gray-900">{user.name}</span>
            </p>

            <Form action="/cms/logout" method="post">
              {({ processing }) => (
                <Button
                  type="submit"
                  variant="secondary"
                  loading={processing}
                  loadingText="Signing out..."
                  fullWidth
                >
                  Log out
                </Button>
              )}
            </Form>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-gray-500">
            You are not signed in.
          </p>
        )}

<p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link
          href="/cms/register"
          className="font-medium text-gray-900 hover:underline"
        >
          Register
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/cms/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
      </div>
    </div>
  )
}
