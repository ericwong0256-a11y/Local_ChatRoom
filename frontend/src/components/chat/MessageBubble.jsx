import { fmtTime } from '../../lib/format.js'

export default function MessageBubble({ message, self }) {
  return (
    <div className={`flex items-start gap-3 ${self ? 'justify-end' : ''}`}>
      {!self && <div className="avatar-md">{message.author?.[0]?.toUpperCase()}</div>}
      <div className={`max-w-md ${self ? 'text-right' : ''}`}>
        {!self && (
          <div className="text-sm font-semibold text-brand-600 mb-1">{message.author}</div>
        )}
        <div className={self ? 'bubble-self' : 'bubble-other'}>
          {message.image && (
            <img
              src={message.image}
              alt=""
              className="bubble-image"
              onClick={() => window.open(message.image, '_blank')}
            />
          )}
          {message.audio && <audio controls src={message.audio} className="bubble-audio" />}
          {message.body && <span>{message.body}</span>}
          <span className={`bubble-time ${self ? 'text-brand-100' : 'text-slate-400'}`}>
            {fmtTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
