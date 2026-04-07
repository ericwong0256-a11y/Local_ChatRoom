import Modal from '../ui/Modal.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

export default function MembersModal({
  room,
  members,
  ownerId,
  meId,
  onClose,
  onLeave,
  onInviteMore,
}) {
  const isOwner = ownerId === meId
  const isDm = !!room?.is_dm

  return (
    <Modal
      title={`${room?.name} — Members`}
      size="sm"
      onClose={onClose}
      footer={
        !isDm && (
          <>
            {isOwner ? (
              <Button onClick={onInviteMore}>+ Invite</Button>
            ) : (
              <Button variant="danger" onClick={onLeave}>Leave channel</Button>
            )}
          </>
        )
      }
    >
      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 -mx-6">
        {members.map((m) => (
          <li key={m.id} className="px-5 py-3 flex items-center gap-3">
            <div className="avatar-md">{m.full_name?.[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate flex items-center gap-2">
                {m.full_name}
                {m.id === ownerId && <Badge variant="brand">owner</Badge>}
              </div>
              <div className="text-xs text-slate-500 truncate">{m.email}</div>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
