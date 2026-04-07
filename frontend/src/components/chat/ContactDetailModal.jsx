import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'

export default function ContactDetailModal({ contact, onClose, onMessage }) {
  if (!contact) return null
  return (
    <Modal
      title="Contact Details"
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => onMessage(contact)}>💬 Send Message</Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="avatar-xl mb-3">{contact.full_name?.[0]?.toUpperCase()}</div>
        <div className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          {contact.full_name}
          {contact.is_admin && <Badge variant="brand">admin</Badge>}
        </div>
        <div className="text-sm text-slate-500 mt-1">{contact.email}</div>
        {contact.created_at && (
          <div className="text-xs text-slate-400 mt-2">
            Joined {new Date(contact.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </Modal>
  )
}
