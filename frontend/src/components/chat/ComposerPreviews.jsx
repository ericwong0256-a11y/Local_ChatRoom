import { fmtDuration } from '../../lib/format.js'

export default function ComposerPreviews({
  pendingImage,
  pendingAudio,
  recording,
  recordSecs,
  onClearImage,
  onClearAudio,
}) {
  return (
    <>
      {pendingImage && (
        <div className="px-6 pt-3">
          <div className="inline-block relative">
            <img
              src={pendingImage}
              alt=""
              className="max-h-32 rounded-lg shadow border border-slate-200"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {pendingAudio && (
        <div className="px-6 pt-3 flex items-center gap-3">
          <audio controls src={pendingAudio} className="max-w-xs" />
          <button
            type="button"
            onClick={onClearAudio}
            className="w-6 h-6 rounded-full bg-red-500 text-white text-xs shadow"
            title="Discard recording"
          >
            ✕
          </button>
        </div>
      )}
      {recording && (
        <div className="px-6 pt-3 flex items-center gap-3 text-sm text-red-600">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording... {fmtDuration(recordSecs)} (max 02:00)
        </div>
      )}
    </>
  )
}
