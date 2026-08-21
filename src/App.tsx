import { useState } from 'react'
import type { PaywallReason, UnlockTier } from './types'
import { isTeacherPack, isUnlocked, loadForm, unlockLifetime, unlockTeacherPack } from './lib/storage'
import { generateWorksheet } from './lib/generators'
import { downloadWorksheet } from './lib/export'
import { wizardInput } from './lib/sheet'
import { Landing } from './components/Landing'
import { Wizard } from './components/Wizard'
import { TeacherStudio } from './components/TeacherStudio'
import { Paywall } from './components/Paywall'

export default function App() {
  const [view, setView] = useState<'landing' | 'wizard' | 'studio'>('landing')
  const [unlocked, setUnlocked] = useState(() => isUnlocked())
  const [teacherPack, setTeacherPack] = useState(() => isTeacherPack())
  const [paywall, setPaywall] = useState<PaywallReason | null>(null)
  const saved = loadForm()

  const unlock = (tier: UnlockTier) => {
    if (tier === 'teacher') {
      unlockTeacherPack()
      setTeacherPack(true)
      setUnlocked(true)
    } else {
      unlockLifetime()
      setUnlocked(true)
    }
    setPaywall(null)
  }

  const samplePdf = async () => {
    const model = generateWorksheet(
      wizardInput({
        type: 'maths',
        childName: 'Aarav',
        classLevel: 3,
        topic: 'addition',
        title: "Aarav's Class 3 Maths Practice",
        theme: 'sunshine',
        unlocked: true,
        seed: 20260822,
        schoolName: 'Sunrise Public School',
        section: 'A',
        subject: 'Mathematics',
        marks: '20',
        timeAllowed: '30 min',
      }),
    )
    await downloadWorksheet(model)
  }

  return (
    <>
      {view === 'landing' ? (
        <Landing
          unlocked={unlocked}
          teacherPack={teacherPack}
          onCreate={() => setView('wizard')}
          onStudio={() => setView('studio')}
          onSample={() => void samplePdf()}
          onUnlock={unlock}
        />
      ) : view === 'studio' ? (
        <TeacherStudio
          unlocked={unlocked}
          teacherPack={teacherPack}
          onHome={() => setView('landing')}
          onRequestPaywall={setPaywall}
        />
      ) : (
        <Wizard
          unlocked={unlocked}
          teacherPack={teacherPack}
          saved={saved}
          onHome={() => setView('landing')}
          onStudio={() => setView('studio')}
          onRequestPaywall={setPaywall}
        />
      )}
      {paywall ? (
        <Paywall
          reason={paywall}
          unlocked={unlocked}
          teacherPack={teacherPack}
          onClose={() => setPaywall(null)}
          onUnlock={unlock}
        />
      ) : null}
    </>
  )
}
