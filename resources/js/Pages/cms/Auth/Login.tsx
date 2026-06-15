import { useState } from 'react'
import { Link, router, usePage } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Input from '@/Components/Form/Input'
import Button from '@/Components/Form/Button'

type PageProps = {
  flash: {
    status?: string
  }
}

export default function Login() {
  const { flash } = usePage<PageProps>().props
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)
    router.post('/cms/login', form, {
      onError: (e) => { setErrors(e); setProcessing(false) },
      onFinish: () => setProcessing(false),
    })
  }

  return (
    <AuthLayout>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Sign in to your account
      </h2>

      {flash.status && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {flash.status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          required
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <Link
            href="/cms/forgot-password"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={processing}
          loadingText="Signing in..."
          fullWidth
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link
          href="/cms/register"
          className="font-medium text-gray-900 hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  )
}