export default function ChatHeader({ room, members, isOwner, onShowMembers, onDelete }) {
  return (
    <header className="bg-brand-600 px-6 py-3 flex items-center gap-4 text-white">
      <button className="text-xl">←</button>
      <div className="flex-1">
        <div className="font-semibold text-lg leading-tight">
          {room?.name || 'Select a room'}
        </div>
        <button
          onClick={() => room?.is_private && onShowMembers()}
          className={`text-xs text-brand-100 ${
            room?.is_private ? 'hover:underline cursor-pointer' : 'cursor-default'
          }`}
        >
          {room?.is_private
            ? `${members.length} member${members.length === 1 ? '' : 's'} • view`
            : 'public channel'}
        </button>
      </div>
      <button className="text-xl">🔍</button>
      {room?.is_private && isOwner && (
        <button
          title="Delete channel"
          onClick={onDelete}
          className="text-xl hover:text-red-200"
        >
          🗑
        </button>
      )}
      <button className="text-xl">⋯</button>
    </header>
  )
}
