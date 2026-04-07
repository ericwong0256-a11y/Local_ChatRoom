import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import SettingsHeader from '../components/settings/SettingsHeader.jsx'
import ProfileSummary from '../components/settings/ProfileSummary.jsx'
import SettingsSidebar from '../components/settings/SettingsSidebar.jsx'
import AccountPanel from '../components/settings/AccountPanel.jsx'
import StoragePanel from '../components/settings/StoragePanel.jsx'

export default function Settings({ go }) {
  const [active, setActive] = useState('account')
  const [me, setMe] = useState(null)

  useEffect(() => {
    api.me().then(setMe).catch(() => go('signin'))
  }, [])

  if (!me) {
    return (
      <div className="auth-screen">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="w-full max-w-3xl card-lg overflow-hidden">
        <SettingsHeader onClose={() => go('chat')} />
        <ProfileSummary me={me} />

        <div className="grid grid-cols-[220px,1fr] min-h-[460px]">
          <SettingsSidebar
            active={active}
            setActive={setActive}
            onSignOut={() => go('signin')}
          />
          <section className="px-6 py-5 overflow-y-auto">
            {active === 'account' && <AccountPanel me={me} onUpdated={setMe} />}
            {active !== 'account' && (
              <p className="text-sm text-slate-500">This section is coming soon.</p>
            )}
            <StoragePanel />
          </section>
        </div>
      </div>
    </div>
  )
}
