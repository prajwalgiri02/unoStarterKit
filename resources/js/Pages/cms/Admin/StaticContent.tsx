import { useState } from 'react'
import { Form, usePage } from '@inertiajs/react'
import { FileText, ScrollText, Shield, Users } from 'lucide-react'

import AdminLayout from '@/layouts/AdminLayout'
import PrimaryButton from '@/components/buttons/primary-button'

type StaticContentItem = {
  id: number
  type: string
  label: string
  title: string
  description: string
}

type PageProps = {
  contents: StaticContentItem[]
  flash: {
    status?: string
  }
}

const contentIcons: Record<string, typeof FileText> = {
  terms_and_conditions: ScrollText,
  privacy_policy: Shield,
  community_guidelines: Users,
}

const contentHints: Record<string, string> = {
  terms_and_conditions: 'Legal terms users must agree to when using the platform.',
  privacy_policy: 'How user data is collected, stored, and protected.',
  community_guidelines: 'Rules and expectations for community participation.',
}

type StaticContentEditorProps = {
  content: StaticContentItem
}

function StaticContentEditor({ content }: StaticContentEditorProps) {
  const Icon = contentIcons[content.type] ?? FileText

  return (
    <div className="stat-card min-h-0!">
      <div className="mb-6 flex items-start gap-4">
        <div className="stat-icon mb-0! shrink-0">
          <Icon size={22} strokeWidth={1.75} />
        </div>

        <div>
          <h2 className="subtitle-sm text-neutral-900">{content.label}</h2>
          <p className="body-xs mt-1 text-neutral-600">
            {contentHints[content.type] ?? 'Update the title and content shown to users.'}
          </p>
        </div>
      </div>

      <Form
        key={content.id}
        action={`/cms/static-content/${content.id}`}
        method="put"
        resetOnSuccess={false}
      >
        {({ errors, processing, recentlySuccessful }) => (
          <div className="flex flex-col gap-6">
            <div className="input-field-group">
              <label htmlFor={`title-${content.id}`} className="caption-lg text-neutral-900">
                Title
              </label>

              <div className="input-field-wrapper">
                <input
                  id={`title-${content.id}`}
                  name="title"
                  type="text"
                  defaultValue={content.title}
                  placeholder="Enter title"
                  className={`input-giant input-outline${errors.title ? ' error' : ''}`}
                  required
                />
              </div>

              {errors.title && (
                <p className="caption-md text-error-500">{errors.title}</p>
              )}
            </div>

            <div className="input-field-group">
              <label htmlFor={`description-${content.id}`} className="caption-lg text-neutral-900">
                Content
              </label>

              <textarea
                id={`description-${content.id}`}
                name="description"
                defaultValue={content.description}
                placeholder="Enter content"
                rows={14}
                className={`textarea-large min-h-[320px]${errors.description ? ' input-error' : ''}`}
                required
              />

              {errors.description && (
                <p className="caption-md text-error-500">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-6">
              <PrimaryButton
                type="submit"
                size="large"
                loading={processing}
                loadingText="Saving..."
              >
                Save & Publish
              </PrimaryButton>

              {recentlySuccessful && (
                <span className="caption-lg text-success-600">Saved successfully.</span>
              )}
            </div>
          </div>
        )}
      </Form>
    </div>
  )
}

export default function StaticContent() {
  const { contents, flash } = usePage<PageProps>().props
  const [activeType, setActiveType] = useState(contents[0]?.type ?? '')

  const activeContent =
    contents.find((content) => content.type === activeType) ?? contents[0]

  return (
    <AdminLayout
      headerLabel="Static Content"
      showSearchBar={false}
      showNotificationButton={false}
    >
      {flash.status && (
        <div className="rounded-2xl border border-neutral-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {flash.status}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <p className="body-xs max-w-2xl text-neutral-600">
          Manage the legal and community pages displayed across the app. Select a section
          below to edit its title and content.
        </p>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-neutral-200 bg-neutral-25 p-2">
          {contents.map((content) => {
            const Icon = contentIcons[content.type] ?? FileText
            const isActive = content.type === activeType

            return (
              <button
                key={content.type}
                type="button"
                onClick={() => setActiveType(content.type)}
                className={[
                  'btns btn-medium gap-2 rounded-2xl px-4 transition-colors',
                  isActive
                    ? 'bg-primary-500 text-base-white'
                    : 'bg-transparent text-neutral-600 hover:bg-primary-50 hover:text-primary-500',
                ].join(' ')}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span className="caption-lg">{content.label}</span>
              </button>
            )
          })}
        </div>

        {activeContent && <StaticContentEditor content={activeContent} />}
      </div>
    </AdminLayout>
  )
}
