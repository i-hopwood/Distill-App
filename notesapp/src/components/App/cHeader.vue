<template>
  <header class="header d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h1><i class="bi bi-droplet-half"></i> Distill</h1>

    <div class="d-flex align-items-center gap-2">
      <template v-if="currentUser">
        <small>{{ currentUser.email }}</small>
        <button class="btn btn-sm btn-outline-light" @click="handleLogout">Log Out</button>
      </template>
      <template v-else>
        <router-link class="btn btn-sm btn-outline-light" to="/login">Log In</router-link>
      </template>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { logout } from '@/services/authService'

export default {
  name: 'cHeader',
  components: {},
  setup() {
    const router = useRouter()
    const { currentUser } = useAuth()

    const handleLogout = async () => {
      await logout()
      router.push({ name: 'login' })
    }

    return { currentUser, handleLogout }
  },
}
</script>
<style scoped></style>
