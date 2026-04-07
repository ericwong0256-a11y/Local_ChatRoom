import { fmtTime } from '../../lib/format.js'

export default function MessageBubble({ message, self }) {
  return (
    <div className={`flex items-start gap-3 ${self ? 'justify-end' : ''}`}>
      {!self && (
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-600">
          {message.author?.[0]?.toUpperCase()}
        </div>
      )}
      <div className={`max-w-md ${self ? 'text-right' : ''}`}>
        {!self && (
          <div className="text-sm font-semibold text-brand-600 mb-1">{message.author}</div>
        )}
        <div
          className={`inline-block px-4 py-2 rounded-2xl text-sm shadow-sm ${
            self
              ? 'bg-brand-500 text-white rounded-br-sm'
              : 'bg-white text-slate-800 rounded-tl-sm'
          }`}
        >
          {message.image && (
            <img
              src={message.image}
              alt=""
              className="block max-w-xs max-h-64 rounded-lg mb-1 cursor-pointer"
              onClick={() => window.open(message.image, '_blank')}
            />
          )}
          {message.audio && (
            <audio controls src={message.audio} className="block max-w-xs mb-1" />
          )}
          {message.body && <span>{message.body}</span>}
          <span
            className={`ml-2 text-[10px] ${self ? 'text-brand-100' : 'text-slate-400'}`}
          >
            {fmtTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
