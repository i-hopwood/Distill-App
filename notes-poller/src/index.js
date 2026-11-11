import { db } from './firebaseAdmin.js'
import { enrichNote } from './ollamaClient.js'
import { startStalenessScheduler } from './staleness.js'

const notesRef = db.collection('notes').where('noteAIReviewed', '==', false)

async function processNote(doc) {
  const data = doc.data()
  console.log(`Processing note ${doc.id}: "${data.noteDetails.slice(0, 50)}..."`)

  try {
    const result = await enrichNote(data.noteDetails)

    await doc.ref.update({
      noteAIReviewed: true,
      noteAITitle: result.title,
      noteAIDetails: result.summary,
      noteAIPriority: result.priority,
      noteAICategory: result.category,
      noteUpdatedDate: new Date().toISOString(),
    })

    console.log(`Updated note ${doc.id} -> "${result.title}" (${result.priority})`)
  } catch (err) {
    console.error(`Failed to process note ${doc.id}:`, err.message)
  }
}

notesRef.onSnapshot(
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        processNote(change.doc)
      }
    })
  },
  (err) => {
    console.error('Snapshot listener error:', err.message)
  },
)

startStalenessScheduler()

console.log('notes-poller running - watching for unprocessed notes...')
