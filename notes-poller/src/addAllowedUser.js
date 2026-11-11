import { db } from './firebaseAdmin.js'

const uid = process.argv[2]
const email = process.argv[3]

if (!uid || !email) {
  console.error('Usage: node src/addAllowedUser.js <uid> <email>')
  process.exit(1)
}

await db.collection('allowedUsers').doc(uid).set({ email, addedAt: new Date().toISOString() })
console.log(`Allow-listed ${email} (${uid})`)
