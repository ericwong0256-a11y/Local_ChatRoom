import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'

export default function InvitesModal({ invites, onClose, onAccept, onDecline }) {
  return (
    <Modal title="Channel Invites" size="md" onClose={onClose}>
      {invites.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No pending invites.</p>
      )}
      <ul className="divide-y divide-slate-100 -mx-6">
        {invites.map((i) => (
          <li key={i.room_id} className="px-6 py-4 flex items-center gap-3">
            <div className="avatar-lg text-lg">🔒</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 truncate">{i.room_name}</div>
              <div className="text-xs text-slate-500 truncate">
                Invited by {i.inviter_name || 'someone'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="btn-sm" onClick={() => onAccept(i.room_id)}>
                Accept
              </Button>
              <Button variant="ghost" className="btn-sm" onClick={() => onDecline(i.room_id)}>
                Decline
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
