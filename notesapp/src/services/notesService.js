import { collection, doc, addDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

const NOTES_COLLECTION = 'notes'

// Live-subscribes to every note belonging to userId. Calls onChange with the
// full note list every time anything changes (add, edit, AI update, complete).
// Returns an unsubscribe function.
export function subscribeToUserNotes(userId, onChange) {
  const notesQuery = query(collection(db, NOTES_COLLECTION), where('userId', '==', userId))

  return onSnapshot(notesQuery, { includeMetadataChanges: true }, (snapshot) => {
    // Skip docs still only in the local write buffer - only show a note once
    // Firestore has actually acknowledged it server-side.
    const notes = snapshot.docs
      .filter((docSnap) => !docSnap.metadata.hasPendingWrites)
      .map((docSnap) => ({
        noteId: docSnap.id,
        ...docSnap.data(),
      }))
    onChange(notes)
  })
}

// Writes the full note record the backend AI service expects to enrich later.
export function addNote(userId, noteText) {
  const now = new Date().toISOString()

  return addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    noteDetails: noteText,
    noteCreatedDate: now,
    noteUpdatedDate: now,
    noteIsActive: true,
    noteAIReviewed: false,
    noteAIPriority: '',
    noteAITitle: '',
    noteAIDetails: '',
    noteAICategory: '',
  })
}

// Flags a note as completed - it stays in Firestore, just no longer active.
export function markNoteCompleted(noteId) {
  return updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    noteIsActive: false,
    noteUpdatedDate: new Date().toISOString(),
  })
}

// Undoes markNoteCompleted.
export function reopenNote(noteId) {
  return updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    noteIsActive: true,
    noteUpdatedDate: new Date().toISOString(),
  })
}

// Edits the original note text and resets it back to unreviewed (clearing any
// prior AI fields) so the poller picks it up and reprocesses it.
export function editNote(noteId, noteText) {
  return updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    noteDetails: noteText,
    noteUpdatedDate: new Date().toISOString(),
    noteAIReviewed: false,
    noteAITitle: '',
    noteAIDetails: '',
    noteAIPriority: '',
    noteAICategory: '',
  })
}
