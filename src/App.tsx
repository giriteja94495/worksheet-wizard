import { useState } from 'react'
import type { PaywallReason } from './types'
import { isUnlocked, loadForm, unlockLifetime } from './lib/storage'
import { generateWorksheet } from './lib/generators'
import { downloadWorksheet } from './lib/export'
import { Landing } from './components/Landing'
import { Wizard } from './components/Wizard'
import { Paywall } from './components/Paywall'

export default function App() {
  const [view, setView] = useState<'landing' | 'wizard'>('landing')
  const [unlocked, setUnlocked] = useState(() => isUnlocked())
  const [paywall, setPaywall] = useState<PaywallReason | null>(null)
  const saved = loadForm()

  const unlock = () => {
    unlockLifetime()
    setUnlocked(true)
    setPaywall(null)
  }

  const samplePdf = async () => {
    const model = generateWorksheet({
      type: 'maths',
      childName: 'Aarav',
      age: 7,
      difficulty: 'easy',
      topic: 'addition',
      title: "Aarav's Maths Practice",
      theme: 'sunshine',
      unlocked: true,
      seed: 20260822,
    })
    await downloadWorksheet(model)
  }

  return (
    <>
      {view === 'landing' ? (
        <Landing
          unlocked={unlocked}
          onCreate={() => setView('wizard')}
          onSample={() => void samplePdf()}
          onUnlock={() => setPaywall('preview')}
        />
      ) : (
        <Wizard
          unlocked={unlocked}
          saved={saved}
          onHome={() => setView('landing')}
          onRequestPaywall={setPaywall}
        />
      )}
      {paywall ? (
        <Paywall reason={paywall} onClose={() => setPaywall(null)} onUnlock={unlock} />
      ) : null}
    </>
  )
}
