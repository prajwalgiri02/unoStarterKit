import { useState, useRef, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import { ChevronDown, MoreVertical, CheckCircle, Trash2 } from 'lucide-react'

import AdminLayout from '@/Layouts/AdminLayout'
import PrimaryButton from '@/Components/buttons/primary-button'

type TicketType = {
  value: string
  label: string
  badge_class: string
}

type Ticket = {
  id: number
  name: string
  email: string
  message: string
  type: string
  type_label: string
  type_badge_class: string
  status: string
  status_label: string
  status_badge_class: string
  resolved_at: string | null
  date: string
  created_at: string
}

type PageProps = {
  tickets: Ticket[]
  ticket_types: TicketType[]
  filters: {
    type: string
    sort: string
  }
  flash: {
    status?: string
  }
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest to Oldest' },
  { value: 'oldest', label: 'Oldest to Newest' },
  { value: 'name_asc', label: 'Name (A – Z)' },
  { value: 'name_desc', label: 'Name (Z – A)' },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  return (
    <div
      className={[
        sizeClasses[size],
        'flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600',
      ].join(' ')}
    >
      {getInitials(name)}
    </div>
  )
}

function Badge({ label, badgeClass }: { label: string; badgeClass: string }) {
  return (
    <span
      className={[
        'all-badge badge-tiny caption-md whitespace-nowrap font-medium',
        badgeClass,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

function TicketMenu({
  ticketId,
  onDelete,
}: {
  ticketId: number
  onDelete: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="flex items-center justify-center rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-base-white shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onDelete(ticketId)
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors caption-lg text-error-600 hover:bg-error-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function MessagesIndex() {
  const { tickets, ticket_types, filters, flash } = usePage<PageProps>().props

  const [selectedId, setSelectedId] = useState<number | null>(tickets[0]?.id ?? null)
  const [sortOpen, setSortOpen] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? tickets[0] ?? null

  function applyFilter(params: Partial<{ type: string; sort: string }>) {
    router.get(
      '/cms/messages',
      { ...filters, ...params },
      { preserveState: true, preserveScroll: true },
    )
  }

  function handleResolve() {
    if (!selectedTicket || selectedTicket.status === 'resolved') return

    setResolving(true)
    router.patch(
      `/cms/messages/${selectedTicket.id}/resolve`,
      {},
      {
        preserveState: false,
        onFinish: () => setResolving(false),
      },
    )
  }

  function handleDeleteRequest(id: number) {
    setConfirmDeleteId(id)
  }

  function handleDeleteConfirm() {
    if (confirmDeleteId === null) return

    setDeleting(true)
    router.delete(`/cms/messages/${confirmDeleteId}`, {
      onSuccess: () => {
        setConfirmDeleteId(null)
        if (selectedId === confirmDeleteId) setSelectedId(null)
      },
      onFinish: () => setDeleting(false),
    })
  }

  const allTab = { value: 'all', label: 'All' }
  const tabs = [allTab, ...ticket_types.map((t) => ({ value: t.value, label: t.label }))]

  return (
    <AdminLayout
      headerLabel="Messages & Support"
      showSearchBar={false}
      showNotificationButton
    >
      {flash.status && (
        <div className="mb-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {flash.status}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-base-white p-6 shadow-xl">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-50">
                <Trash2 size={18} className="text-error-600" />
              </div>
              <h3 className="subtitle-sm text-neutral-900">Delete Ticket</h3>
            </div>
            <p className="body-xs mb-6 mt-2 text-neutral-600">
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="btns btn-large flex-1 rounded-xl border border-neutral-200 bg-transparent text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 caption-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="btns btn-large flex-1 rounded-xl bg-error-600 text-base-white hover:bg-error-700 disabled:opacity-50 caption-lg"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-10rem)] min-h-[600px] gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-base-white">
        {/* Left panel — inbox */}
        <div className="flex w-[420px] shrink-0 flex-col border-r border-neutral-200">
          {/* Inbox header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="subtitle-sm text-neutral-900">Inbox</h2>

            {/* Sort by */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((prev) => !prev)}
                className="btns btn-small flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-transparent px-3 text-neutral-600 hover:bg-neutral-50"
              >
                <span className="caption-lg">Sort by</span>
                <ChevronDown size={14} strokeWidth={2} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-base-white shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        applyFilter({ sort: option.value })
                        setSortOpen(false)
                      }}
                      className={[
                        'w-full px-4 py-2.5 text-left transition-colors',
                        'caption-lg',
                        filters.sort === option.value
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-neutral-700 hover:bg-neutral-50',
                      ].join(' ')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex gap-1 border-b border-neutral-200 px-4 pt-3 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => applyFilter({ type: tab.value })}
                className={[
                  'caption-lg shrink-0 rounded-t-lg px-4 py-2 transition-colors',
                  filters.type === tab.value
                    ? 'border border-b-0 border-neutral-200 bg-base-white text-primary-600 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-700',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="body-xs text-neutral-500">No tickets found.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(ticket.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(ticket.id)}
                  className={[
                    'flex w-full cursor-pointer items-center gap-3 border-b border-neutral-100 px-5 py-3.5 text-left transition-colors',
                    selectedId === ticket.id ? 'bg-primary-25' : 'hover:bg-neutral-50',
                  ].join(' ')}
                >
                  <Avatar name={ticket.name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="caption-lg truncate font-semibold text-neutral-900">
                        {ticket.name}
                      </span>
                      <span className="caption-md shrink-0 text-neutral-400">{ticket.date}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <Badge label={ticket.type_label} badgeClass={ticket.type_badge_class} />
                      <Badge label={ticket.status_label} badgeClass={ticket.status_badge_class} />
                    </div>
                  </div>

                  <TicketMenu ticketId={ticket.id} onDelete={handleDeleteRequest} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel — detail */}
        {selectedTicket ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Detail header */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
              <Avatar name={selectedTicket.name} size="lg" />

              <div className="flex-1">
                <p className="subtitle-sm text-neutral-900">{selectedTicket.name}</p>
                <p className="caption-md text-neutral-500">{selectedTicket.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  label={selectedTicket.type_label}
                  badgeClass={selectedTicket.type_badge_class}
                />
                <Badge
                  label={selectedTicket.status_label}
                  badgeClass={selectedTicket.status_badge_class}
                />
              </div>

              {selectedTicket && (
                <TicketMenu ticketId={selectedTicket.id} onDelete={handleDeleteRequest} />
              )}
            </div>

            {/* Detail body */}
            <div className="flex-1 px-6 py-6">
              <div className="mb-5">
                <p className="caption-md mb-1 text-neutral-500">Date</p>
                <p className="body-sm font-medium text-neutral-900">{selectedTicket.date}</p>
              </div>

              <div>
                <p className="caption-md mb-2 text-neutral-500">{selectedTicket.type_label}</p>
                <p className="body-sm mb-3 font-semibold text-neutral-900">
                  This is placeholder text only
                </p>
                <p className="body-xs leading-relaxed text-neutral-600">{selectedTicket.message}</p>
              </div>
            </div>

            {/* Detail footer */}
            {selectedTicket.status !== 'resolved' && (
              <div className="border-t border-neutral-200 px-6 py-5">
                <PrimaryButton
                  size="large"
                  loading={resolving}
                  loadingText="Resolving..."
                  onClick={handleResolve}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Mark as Completed
                </PrimaryButton>
              </div>
            )}

            {selectedTicket.status === 'resolved' && (
              <div className="border-t border-neutral-200 px-6 py-5">
                <div className="inline-flex items-center gap-2 rounded-xl bg-success-50 px-4 py-2.5 text-success-700">
                  <CheckCircle size={16} />
                  <span className="caption-lg font-medium">Resolved</span>
                  {selectedTicket.resolved_at && (
                    <span className="caption-md text-success-600">· {selectedTicket.resolved_at}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="body-xs text-neutral-500">Select a ticket to view details.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
