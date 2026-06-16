import { useState } from 'react'
import { Form, router, usePage } from '@inertiajs/react'
import { ChevronDown, ChevronUp, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react'

import AdminLayout from '@/Layouts/AdminLayout'
import PrimaryButton from '@/Components/buttons/primary-button'

type FaqItem = {
  id: number
  question: string
  answer: string
}

type PageProps = {
  faqs: FaqItem[]
  flash: {
    status?: string
  }
}

type FaqFormProps = {
  faq?: FaqItem
  onCancel: () => void
}

function FaqForm({ faq, onCancel }: FaqFormProps) {
  const isEditing = faq !== undefined

  return (
    <Form
      action={isEditing ? `/cms/faqs/${faq.id}` : '/cms/faqs'}
      method={isEditing ? 'put' : 'post'}
      onSuccess={onCancel}
    >
      {({ errors, processing }) => (
        <div className="stat-card min-h-0! flex flex-col gap-5">
          <h3 className="subtitle-sm text-neutral-900">
            {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
          </h3>

          <div className="input-field-group">
            <label className="caption-lg text-neutral-900">Question</label>
            <div className="input-field-wrapper">
              <input
                name="question"
                type="text"
                defaultValue={faq?.question ?? ''}
                placeholder="Enter the question"
                className={`input-giant input-outline${errors.question ? ' error' : ''}`}
                required
              />
            </div>
            {errors.question && (
              <p className="caption-md text-error-500">{errors.question}</p>
            )}
          </div>

          <div className="input-field-group">
            <label className="caption-lg text-neutral-900">Answer</label>
            <textarea
              name="answer"
              defaultValue={faq?.answer ?? ''}
              placeholder="Enter the answer"
              rows={5}
              className={`textarea-large${errors.answer ? ' input-error' : ''}`}
              required
            />
            {errors.answer && (
              <p className="caption-md text-error-500">{errors.answer}</p>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-neutral-200 pt-5">
            <PrimaryButton type="submit" size="large" loading={processing} loadingText="Saving...">
              {isEditing ? 'Save Changes' : 'Add FAQ'}
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

type FaqRowProps = {
  faq: FaqItem
  onEdit: (faq: FaqItem) => void
}

function FaqRow({ faq, onEdit }: FaqRowProps) {
  const [expanded, setExpanded] = useState(false)

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    router.delete(`/cms/faqs/${faq.id}`, { preserveScroll: true })
  }

  return (
    <div className="stat-card min-h-0! flex flex-col gap-0 p-0! overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <div className="stat-icon mb-0! shrink-0">
            <HelpCircle size={18} strokeWidth={1.75} />
          </div>
          <span className="caption-lg text-neutral-900">{faq.question}</span>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="shrink-0 text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-neutral-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-5 py-4">
          <p className="body-xs text-neutral-600 whitespace-pre-wrap">{faq.answer}</p>

          <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={() => onEdit(faq)}
              className="btns btn-small gap-1.5 rounded-xl border border-neutral-200 bg-transparent px-3 text-neutral-600 hover:bg-neutral-50"
            >
              <Pencil size={14} strokeWidth={1.75} />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btns btn-small gap-1.5 rounded-xl border border-error-200 bg-transparent px-3 text-error-600 hover:bg-error-50"
            >
              <Trash2 size={14} strokeWidth={1.75} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FaqsIndex() {
  const { faqs, flash } = usePage<PageProps>().props
  const [showCreate, setShowCreate] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)

  const handleEdit = (faq: FaqItem) => {
    setShowCreate(false)
    setEditingFaq(faq)
  }

  const handleCancelEdit = () => setEditingFaq(null)
  const handleCancelCreate = () => setShowCreate(false)

  return (
    <AdminLayout
      headerLabel="FAQs"
      showSearchBar={false}
      showNotificationButton={false}
    >
      {flash.status && (
        <div className="rounded-2xl border border-neutral-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {flash.status}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="body-xs max-w-2xl text-neutral-600">
            Manage frequently asked questions displayed across the app.
          </p>
          {!showCreate && (
            <PrimaryButton
              size="medium"
              onClick={() => {
                setEditingFaq(null)
                setShowCreate(true)
              }}
            >
              <Plus size={16} strokeWidth={1.75} />
              Add FAQ
            </PrimaryButton>
          )}
        </div>

        {showCreate && (
          <FaqForm onCancel={handleCancelCreate} />
        )}

        {faqs.length === 0 && !showCreate ? (
          <div className="stat-card flex flex-col items-center gap-3 py-12 text-center">
            <HelpCircle size={36} strokeWidth={1.25} className="text-neutral-300" />
            <p className="body-sm text-neutral-500">No FAQs yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {faqs.map((faq) =>
              editingFaq?.id === faq.id ? (
                <FaqForm key={faq.id} faq={faq} onCancel={handleCancelEdit} />
              ) : (
                <FaqRow key={faq.id} faq={faq} onEdit={handleEdit} />
              ),
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
