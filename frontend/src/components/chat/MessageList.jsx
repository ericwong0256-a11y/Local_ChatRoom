import MessageBubble from './MessageBubble.jsx'

export default function MessageList({ messages, meId, scrollRef }) {
  return (
    <div ref={scrollRef} className="chat-messages">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} self={m.user_id === meId} />
      ))}
    </div>
  )
}
