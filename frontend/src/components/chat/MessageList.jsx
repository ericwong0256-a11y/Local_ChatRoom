import MessageBubble from './MessageBubble.jsx'

export default function MessageList({ messages, meId, scrollRef }) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} self={m.user_id === meId} />
      ))}
    </div>
  )
}
