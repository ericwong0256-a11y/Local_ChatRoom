import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { auth } from '../lib/auth.js'
import { useRooms } from '../hooks/useRooms.js'
import { useMessages } from '../hooks/useMessages.js'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js'

import Sidebar from '../components/chat/Sidebar.jsx'
import ChatHeader from '../components/chat/ChatHeader.jsx'
import MessageList from '../components/chat/MessageList.jsx'
import Composer from '../components/chat/Composer.jsx'
import CreateChannelModal from '../components/chat/CreateChannelModal.jsx'
import MembersModal from '../components/chat/MembersModal.jsx'
import ScreenCaptureModal from '../components/chat/ScreenCaptureModal.jsx'

export default function Chat({ go }) {
  const me = auth.user()

  const { rooms, activeRoom, activeRoomObj, setActiveRoom, loadRooms } = useRooms({
    onUnauthorized: () => go('signin'),
  })
  const { messages, setMessages, members, scrollRef, sendMessage } = useMessages(activeRoom)

  const [contacts, setContacts] = useState([])
  const [draft, setDraft] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [pendingAudio, setPendingAudio] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  const recorder = useVoiceRecorder({ onComplete: setPendingAudio })

  useEffect(() => {
    api.contacts().then(setContacts).catch(() => {})
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

  const handleSelectContact = async (contact) => {
    try {
      const room = await api.openDm(contact.id)
      loadRooms(room.id)
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
          onClose={() => setShowMembers(false)}
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
    </div>
  )
}
