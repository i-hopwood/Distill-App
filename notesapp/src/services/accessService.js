import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export async function isUserAllowed(uid) {
  if (!uid) return false

  try {
    const snap = await getDoc(doc(db, 'allowedUsers', uid))
    return snap.exists()
  } catch (err) {
    // Fail safe: any error (including permission-denied from stale rules)
    // means we cannot confirm access, so treat it as not allowed.
    console.error('Failed to check allow-list:', err)
    return false
  }
}
