import { Form, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import Input from '@/components/Form/Input'
import Button from '@/components/Form/Button'
import useCountdownUntil from '@/hooks/useCountdownUntil'

type OtpVerifyProps = {
  token: string
  email: string
  status?: string
  resendAvailableAt?: string | null
}

export default function OtpVerify({
  token,
  email,
  status,
}: OtpVerifyProps) {
  const { props } = usePage<OtpVerifyProps>()
  const errors = props.errors as Record<string, string>
  const resendAvailableAt = props.resendAvailableAt ?? null
  
  const resendCooldown = useCountdownUntil(resendAvailableAt)
  const canResend = resendCooldown === 0
  const otpLength = 6 // Default length

  return (
    <AdminLayout headerLabel="Verify Changes" showSearchBar={false}>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Verify your identity
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            To change your email or password, please enter the {otpLength}-digit code we sent to{' '}
            <span className="font-medium text-gray-900">{email}</span>.
          </p>

          {status && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {status}
            </div>
          )}

          {errors.otp && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.otp}
            </div>
          )}

          <Form action={`/cms/settings/verify/${token}`} method="post">
            {({ processing }) => (
              <div className="space-y-4">
                <Input
                  name="otp"
                  type="text"
                  label="Verification code"
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={otpLength}
                  error={errors.otp}
                  autoFocus
                  required
                />

                <Button
                  type="submit"
                  loading={processing}
                  loadingText="Verifying..."
                  fullWidth
                >
                  Confirm Changes
                </Button>
              </div>
            )}
          </Form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Form action={`/cms/settings/resend/${token}`} method="post">
              {({ processing }) => (
                <button
                  type="submit"
                  disabled={!canResend || processing}
                  className="font-medium text-teal-700 hover:text-teal-800 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {canResend
                    ? 'Resend code'
                    : `Resend code in ${resendCooldown}s`}
                </button>
              )}
            </Form>

            <a
              href="/cms/settings"
              className="text-gray-500 hover:text-gray-900"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
