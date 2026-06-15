import { Form, usePage } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Input from '@/Components/Form/Input'
import Button from '@/Components/Form/Button'
import useCountdownUntil from '@/hooks/useCountdownUntil'

type VerifyPasswordOtpProps = {
  token: string
  email: string
  otpLength: number
  status?: string
  isExpired?: boolean
  errors?: Record<string, string>
  resendAvailableAt?: string | null
}

export default function VerifyPasswordOtp({
  token,
  email,
  otpLength,
  status,
}: VerifyPasswordOtpProps) {
  const { errors = {}, resendAvailableAt = null, isExpired = false } =
    usePage<VerifyPasswordOtpProps>().props
  const resendCooldown = useCountdownUntil(isExpired ? null : resendAvailableAt)
  const canResend = isExpired || resendCooldown === 0
  const otpPlaceholder = '0'.repeat(otpLength)

  return (
    <AuthLayout>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Enter verification code
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        We sent a {otpLength}-digit code to{' '}
        <span className="font-medium text-gray-900">{email}</span>.
      </p>

      {status && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {status}
        </div>
      )}

      {isExpired && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your verification code has expired. Resend a new code below.
        </div>
      )}

      {resendCooldown > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please wait <span className="font-semibold">{resendCooldown}</span> seconds before resending.
        </div>
      )}

      {errors.otp && !isExpired && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errors.otp}
        </div>
      )}

      <Form action={`/cms/forgot-password/verify/${token}`} method="post">
        {({ processing }) => (
          <div className="space-y-4">
            <Input
              name="otp"
              type="text"
              label="Verification code"
              placeholder={otpPlaceholder}
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
              Verify code
            </Button>
          </div>
        )}
      </Form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Form action={`/cms/forgot-password/resend/${token}`} method="post">
          {({ processing }) => (
            <button
              type="submit"
              disabled={!canResend || processing}
              className="font-medium text-gray-900 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
            >
              {canResend
                ? 'Resend code'
                : `Resend code in ${resendCooldown}s`}
            </button>
          )}
        </Form>

        <Form action={`/cms/forgot-password/cancel/${token}`} method="post">
          {({ processing }) => (
            <button
              type="submit"
              disabled={processing}
              className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </Form>
      </div>
    </AuthLayout>
  )
}
