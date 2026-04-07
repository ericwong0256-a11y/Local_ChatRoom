import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'
import { useRooms } from '../hooks/useRooms.js'
import { useMessages } from '../hooks/useMessages.js'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js'
import { useNotifications } from '../hooks/useNotifications.js'

import Sidebar from '../components/chat/Sidebar.jsx'
import ChatHeader from '../components/chat/ChatHeader.jsx'
import MessageList from '../components/chat/MessageList.jsx'
import Composer from '../components/chat/Composer.jsx'
import CreateChannelModal from '../components/chat/CreateChannelModal.jsx'
import MembersModal from '../components/chat/MembersModal.jsx'
import ScreenCaptureModal from '../components/chat/ScreenCaptureModal.jsx'
import InvitesModal from '../components/chat/InvitesModal.jsx'
import InviteMoreModal from '../components/chat/InviteMoreModal.jsx'
import ContactDetailModal from '../components/chat/ContactDetailModal.jsx'

export default function Chat({ go }) {
  const me = auth.user()

  const { rooms, activeRoom, activeRoomObj, setActiveRoom, loadRooms } = useRooms({
    onUnauthorized: () => go('signin'),
  })
  const { messages, setMessages, members, scrollRef, sendMessage } = useMessages(activeRoom)
  const { unread } = useNotifications({ activeRoom, meId: me?.id, rooms })

  const [contacts, setContacts] = useState([])
  const [draft, setDraft] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [pendingAudio, setPendingAudio] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showCapture, setShowCapture] = useState(false)
  const [invites, setInvites] = useState([])
  const [showInvites, setShowInvites] = useState(false)
  const [showInviteMore, setShowInviteMore] = useState(false)
  const [detailContact, setDetailContact] = useState(null)

  const loadInvites = () => api.invites().then(setInvites).catch(() => {})

  const recorder = useVoiceRecorder({ onComplete: setPendingAudio })

  useEffect(() => {
    api.contacts().then(setContacts).catch(() => {})
    loadInvites()
    const t = setInterval(loadInvites, 15000)
    return () => clearInterval(t)
  }, [])

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage({
      roomId: activeRoom,
      body: draft,
      image: pendingImage,
      audio: pendingAudio,
    })
    setDraft('')
    setPendingImage(null)
    setPendingAudio(null)
  }

  const handleSelectContact = (contact) => setDetailContact(contact)

  const handleMessageContact = async (contact) => {
    try {
      const room = await api.openDm(contact.id)
      setDetailContact(null)
      loadRooms(room.id)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLeaveRoom = async () => {
    if (!activeRoomObj) return
    if (!confirm(`Leave "${activeRoomObj.name}"?`)) return
    try {
      await api.leaveRoom(activeRoomObj.id)
      setShowMembers(false)
      setActiveRoom(null)
      setMessages([])
      loadRooms()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteRoom = async () => {
    if (!activeRoomObj) return
    if (!confirm(`Delete channel "${activeRoomObj.name}"? This cannot be undone.`)) return
    try {
      await api.deleteRoom(activeRoomObj.id)
      setActiveRoom(null)
      setMessages([])
      loadRooms()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="chat-shell">
      <Sidebar
        me={me}
        rooms={rooms}
        contacts={contacts}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onSelectContact={handleSelectContact}
        onCreateChannel={() => setShowCreate(true)}
        onShowInvites={() => setShowInvites(true)}
        inviteCount={invites.length}
        unread={unread}
        go={go}
      />

      <main className="chat-main">
        <ChatHeader
          room={activeRoomObj}
          members={members}
          isOwner={activeRoomObj?.owner_id === me?.id}
          onShowMembers={() => setShowMembers(true)}
          onDelete={handleDeleteRoom}
        />

        <MessageList messages={messages} meId={me?.id} scrollRef={scrollRef} />

        <Composer
          draft={draft}
          setDraft={setDraft}
          onSend={handleSend}
          pendingImage={pendingImage}
          pendingAudio={pendingAudio}
          setPendingImage={setPendingImage}
          setPendingAudio={setPendingAudio}
          onOpenScreenCapture={() => setShowCapture(true)}
          recording={recorder.recording}
          recordSecs={recorder.seconds}
          onToggleRecord={recorder.toggle}
        />
      </main>

      {showCreate && (
        <CreateChannelModal
          contacts={contacts.filter((c) => c.id !== me?.id)}
          onClose={() => setShowCreate(false)}
          onCreated={(room) => {
            setShowCreate(false)
            loadRooms(room.id)
          }}
        />
      )}

      {showMembers && (
        <MembersModal
          room={activeRoomObj}
          members={members}
          ownerId={activeRoomObj?.owner_id}
          meId={me?.id}
          onClose={() => setShowMembers(false)}
          onLeave={handleLeaveRoom}
          onInviteMore={() => {
            setShowMembers(false)
            setShowInviteMore(true)
          }}
        />
      )}

      {detailContact && (
        <ContactDetailModal
          contact={detailContact}
          onClose={() => setDetailContact(null)}
          onMessage={handleMessageContact}
        />
      )}

      {showInviteMore && activeRoomObj && (
        <InviteMoreModal
          room={activeRoomObj}
          contacts={contacts}
          members={members}
          onClose={() => setShowInviteMore(false)}
          onInvited={() => {
            // Refresh members so newly-pending users don't show as already-members later
          }}
        />
      )}

      {showCapture && (
        <ScreenCaptureModal
          onClose={() => setShowCapture(false)}
          onCapture={(dataUrl) => {
            setPendingImage(dataUrl)
            setShowCapture(false)
          }}
        />
      )}

      {showInvites && (
        <InvitesModal
          invites={invites}
          onClose={() => setShowInvites(false)}
          onAccept={async (roomId) => {
            try {
              await api.acceptInvite(roomId)
              await loadInvites()
              loadRooms(roomId)
            } catch (err) {
              alert(err.message)
            }
          }}
          onDecline={async (roomId) => {
            try {
              await api.declineInvite(roomId)
              loadInvites()
            } catch (err) {
              alert(err.message)
            }
          }}
        />
      )}
    </div>
  )
}
