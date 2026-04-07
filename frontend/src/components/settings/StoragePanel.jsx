import { useState } from 'react'
import Button from '../ui/Button.jsx'

export default function StoragePanel() {
  const [autoDl, setAutoDl] = useState(true)

  return (
    <>
      <h3 className="font-semibold text-slate-800 mt-6 mb-2">Language</h3>
      <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 text-sm">
        <span>English</span>
        <button className="link font-medium">Browse</button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-medium text-slate-800">Auto-download path</span>
        <button
          onClick={() => setAutoDl(!autoDl)}
          className={`w-11 h-6 rounded-full relative transition ${
            autoDl ? 'bg-brand-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
              autoDl ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" defaultChecked /> Photos
          </span>
          <span className="text-xs px-2 py-1 border border-slate-200 rounded">1 MB</span>
        </label>
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" defaultChecked /> Files
          </span>
          <select className="text-xs px-2 py-1 border border-slate-200 rounded">
            <option>1 MB</option>
            <option>5 MB</option>
            <option>10 MB</option>
          </select>
        </label>
      </div>

      <Button variant="danger" block className="mt-6">Delete Account</Button>
    </>
  )
}
