import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'

const currentUser = ref(null)
const authReady = ref(false)

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  authReady.value = true
})

export function useAuth() {
  return { currentUser, authReady }
}
