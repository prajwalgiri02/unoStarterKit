import { useForm, usePage } from '@inertiajs/react'
import { Camera, Eye, EyeOff } from 'lucide-react'
import { useRef, useState } from 'react'

import AdminLayout from '@/layouts/AdminLayout'
import Input from '@/components/Form/Input'
import PrimaryButton from '@/components/buttons/primary-button'

type AuthUser = {
  id: number
  name: string
  email: string
  avatar: string | null
}

type PageProps = {
  auth: { user: AuthUser }
  flash: { status?: string }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Settings() {
  const { auth, flash } = usePage<PageProps>().props
  const user = auth.user

  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    avatar: null as File | null,
    _method: 'PUT',
  })

  const avatarUrl =
    avatarPreview ?? (user.avatar ? `/storage/${user.avatar}` : null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setData('avatar', file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/cms/settings', {
      forceFormData: true,
      onSuccess: () => {
        setEditing(false)
        reset('password', 'password_confirmation')
        setAvatarPreview(null)
      },
    })
  }

  function handleCancel() {
    setEditing(false)
    reset()
    setAvatarPreview(null)
    setData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      avatar: null,
      _method: 'PUT',
    })
  }

  return (
    <AdminLayout headerLabel="Settings" showSearchBar={false}>
      <div className="max-w-2xl">
        {flash.status && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
            {flash.status}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          {/* Card header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Profile</h2>
            {!editing && (
              <PrimaryButton size="small" onClick={() => setEditing(true)}>
                Edit Details
              </PrimaryButton>
            )}
          </div>

          {/* Avatar + name */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  {getInitials(user.name)}
                </div>
              )}

              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  aria-label="Change avatar"
                >
                  <Camera size={20} className="text-white" />
                </button>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>

            {editing && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            )}
          </div>

          {/* View mode */}
          {!editing && (
            <div className="space-y-4">
              <div>
                <p className="mb-0.5 text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="mb-0.5 text-xs text-gray-500">Password</p>
                <p className="text-sm font-medium tracking-widest text-gray-900">
                  ••••••••••
                </p>
              </div>
            </div>
          )}

          {/* Edit mode */}
          {editing && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name="name"
                  label="Full Name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  error={errors.email}
                  required
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Change Password
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <Input
                    name="password_confirmation"
                    type={showConfirm ? 'text' : 'password'}
                    label="Confirm New Password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <PrimaryButton type="submit" size="large" loading={processing}>
                  Save Changes
                </PrimaryButton>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
