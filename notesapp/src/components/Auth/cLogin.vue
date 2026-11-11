<template>
  <div class="card mx-auto" style="max-width: 420px">
    <div class="card-body">
      <h4 class="card-title mb-3">Log In</h4>

      <div v-if="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

      <cInput v-model="email" type="email" label="Email" />
      <cInput v-model="password" type="password" label="Password" />

      <button class="btn btn-primary w-100 mt-3" :disabled="isSubmitting" @click="handleLogin">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
        {{ isSubmitting ? 'Logging in...' : 'Log In' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import cInput from '@/components/Common/cInput.vue'
import { login, friendlyAuthError } from '@/services/authService'

export default {
  name: 'cLogin',
  components: { cInput },
  setup() {
    const router = useRouter()
    const email = ref({ $model: '' })
    const password = ref({ $model: '' })
    const isSubmitting = ref(false)
    const errorMessage = ref('')

    const handleLogin = async () => {
      errorMessage.value = ''

      if (!email.value.$model || !password.value.$model) {
        errorMessage.value = 'Please enter both email and password.'
        return
      }

      isSubmitting.value = true
      try {
        await login(email.value.$model, password.value.$model)
        router.push({ name: 'home' })
      } catch (err) {
        errorMessage.value = friendlyAuthError(err.code)
      } finally {
        isSubmitting.value = false
      }
    }

    return { email, password, isSubmitting, errorMessage, handleLogin }
  },
}
</script>
<style scoped></style>
