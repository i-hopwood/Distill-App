import 'dotenv/config'
import { db } from './firebaseAdmin.js'

// Deterministic date-based priority escalation - no LLM call needed, this is
// just "you've had this a while, it deserves more attention now."
const STALE_DAYS_TO_MEDIUM = Number(process.env.STALE_DAYS_TO_MEDIUM || 7)
const STALE_DAYS_TO_HIGH = Number(process.env.STALE_DAYS_TO_HIGH || 14)
const CHECK_INTERVAL_HOURS = Number(process.env.STALE_CHECK_INTERVAL_HOURS || 6)

const MS_PER_DAY = 1000 * 60 * 60 * 24

function ageInDays(note) {
  const created = new Date(note.noteCreatedDate)
  return (Date.now() - created.getTime()) / MS_PER_DAY
}

function escalatedPriority(note) {
  const age = ageInDays(note)

  if (note.noteAIPriority === 'Medium' && age >= STALE_DAYS_TO_HIGH) return 'High'
  if (note.noteAIPriority === 'Low' && age >= STALE_DAYS_TO_MEDIUM) return 'Medium'

  return null
}

export async function escalateStaleNotes() {
  const snapshot = await db
    .collection('notes')
    .where('noteIsActive', '==', true)
    .where('noteAIReviewed', '==', true)
    .get()

  let escalated = 0

  for (const doc of snapshot.docs) {
    const note = doc.data()
    const newPriority = escalatedPriority(note)
    if (!newPriority) continue

    await doc.ref.update({
      noteAIPriority: newPriority,
      noteUpdatedDate: new Date().toISOString(),
    })
    console.log(`Escalated note ${doc.id}: ${note.noteAIPriority} -> ${newPriority} (stale)`)
    escalated++
  }

  if (escalated === 0) {
    console.log('Staleness check: nothing to escalate.')
  }
}

export function startStalenessScheduler() {
  escalateStaleNotes().catch((err) => console.error('Staleness check failed:', err.message))

  setInterval(
    () => escalateStaleNotes().catch((err) => console.error('Staleness check failed:', err.message)),
    CHECK_INTERVAL_HOURS * 60 * 60 * 1000,
  )
}
