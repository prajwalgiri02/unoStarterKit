import { useState } from 'react'
import { Form, usePage } from '@inertiajs/react'
import { Bell, Plus, Send, Calendar, MapPin, Users, Link as LinkIcon } from 'lucide-react'

import AdminLayout from '@/Layouts/AdminLayout'
import PrimaryButton from '@/Components/buttons/primary-button'

type NotificationBroadcast = {
  id: number
  title: string
  message: string
  location: string | null
  subscription_type: string | null
  send_to_all: boolean
  url: string | null
  scheduled_at: string | null
  sent_at: string | null
  creator?: {
    name: string
  }
  created_at: string
}

type PageProps = {
  notifications: {
    data: NotificationBroadcast[]
    links: any[]
  }
  flash: {
    status?: string
  }
}

function BroadcastForm({ onCancel }: { onCancel: () => void }) {
  return (
    <Form
      action="/cms/notifications"
      method="post"
      onSuccess={onCancel}
    >
      {({ errors, processing, data, setData }) => (
        <div className="stat-card min-h-0! flex flex-col gap-5">
          <h3 className="subtitle-sm text-neutral-900">
            Create New Broadcast
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="input-field-group md:col-span-2">
              <label className="caption-lg text-neutral-900">Title</label>
              <div className="input-field-wrapper">
                <input
                  name="title"
                  type="text"
                  placeholder="Enter notification title"
                  className={`input-giant input-outline${errors.title ? ' error' : ''}`}
                  required
                />
              </div>
              {errors.title && (
                <p className="caption-md text-error-500">{errors.title}</p>
              )}
            </div>

            <div className="input-field-group md:col-span-2">
              <label className="caption-lg text-neutral-900">Message</label>
              <textarea
                name="message"
                placeholder="Enter the notification message"
                rows={3}
                className={`textarea-large${errors.message ? ' input-error' : ''}`}
                required
              />
              {errors.message && (
                <p className="caption-md text-error-500">{errors.message}</p>
              )}
            </div>

            <div className="input-field-group">
              <label className="caption-lg text-neutral-900">Target Location (Optional)</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  <MapPin size={18} />
                </div>
                <input
                  name="location"
                  type="text"
                  placeholder="e.g. New York"
                  className="input-giant input-outline pl-11"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="caption-lg text-neutral-900">Subscription Types (Optional)</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  <Users size={18} />
                </div>
                <input
                  name="subscription_type"
                  type="text"
                  placeholder="e.g. free, annual (comma separated)"
                  className="input-giant input-outline pl-11"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="caption-lg text-neutral-900">Action URL (Optional)</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  <LinkIcon size={18} />
                </div>
                <input
                  name="url"
                  type="url"
                  placeholder="https://example.com"
                  className="input-giant input-outline pl-11"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="caption-lg text-neutral-900">Schedule (Optional)</label>
              <div className="input-field-wrapper">
                <div className="input-icon-left">
                  <Calendar size={18} />
                </div>
                <input
                  name="scheduled_at"
                  type="datetime-local"
                  className="input-giant input-outline pl-11"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="send_to_all"
                name="send_to_all"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="send_to_all" className="caption-lg text-neutral-900">
                Send to all users (ignores location and subscription filters)
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
            <PrimaryButton type="submit" size="large" loading={processing} loadingText="Broadcasting...">
              <Send size={18} className="mr-2" />
              Broadcast Now
            </PrimaryButton>
            <button
              type="button"
              onClick={onCancel}
              className="btns btn-medium rounded-2xl border border-neutral-200 bg-transparent px-4 text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Form>
  )
}

export default function NotificationsIndex() {
  const { notifications, flash } = usePage<PageProps>().props
  const [showCreate, setShowCreate] = useState(false)

  return (
    <AdminLayout
      headerLabel="Broadcast Notifications"
      showSearchBar={false}
      showNotificationButton={false}
    >
      {flash.status && (
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {flash.status}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="body-xs max-w-2xl text-neutral-600">
            Send push and in-app notifications to your users based on their location or subscription status.
          </p>
          {!showCreate && (
            <PrimaryButton
              size="medium"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={16} strokeWidth={1.75} />
              New Broadcast
            </PrimaryButton>
          )}
        </div>

        {showCreate && (
          <BroadcastForm onCancel={() => setShowCreate(false)} />
        )}

        <div className="flex flex-col gap-4">
          <h3 className="subtitle-sm text-neutral-900">Recent Broadcasts</h3>
          
          {notifications.data.length === 0 ? (
            <div className="stat-card flex flex-col items-center gap-3 py-12 text-center">
              <Bell size={36} strokeWidth={1.25} className="text-neutral-300" />
              <p className="body-sm text-neutral-500">No broadcasts sent yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notifications.data.map((notification) => (
                <div key={notification.id} className="stat-card min-h-0! flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="stat-icon mb-0! shrink-0">
                        <Bell size={18} strokeWidth={1.75} />
                      </div>
                      <div>
                        <h4 className="caption-lg font-semibold text-neutral-900">{notification.title}</h4>
                        <p className="caption-md text-neutral-500">
                          By {notification.creator?.name} • {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {notification.sent_at ? (
                      <span className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700">
                        Sent
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-700">
                        Scheduled
                      </span>
                    )}
                  </div>
                  
                  <p className="body-xs text-neutral-600">{notification.message}</p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {notification.send_to_all ? (
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Users size={14} />
                        <span className="caption-md text-xs">All Users</span>
                      </div>
                    ) : (
                      <>
                        {notification.location && (
                          <div className="flex items-center gap-1.5 text-neutral-500">
                            <MapPin size={14} />
                            <span className="caption-md text-xs">{notification.location}</span>
                          </div>
                        )}
                        {notification.subscription_type && (
                          <div className="flex items-center gap-1.5 text-neutral-500">
                            <Users size={14} />
                            <span className="caption-md text-xs">{notification.subscription_type}</span>
                          </div>
                        )}
                      </>
                    )}
                    {notification.url && (
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <LinkIcon size={14} />
                        <span className="caption-md text-xs truncate max-w-[200px]">{notification.url}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
