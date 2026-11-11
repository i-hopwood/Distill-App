<template>
  <div class="container d-flex justify-content-center">
    <div class="card mt-5" style="max-width: 480px">
      <div class="card-body text-center">
        <i class="bi bi-shield-lock display-4 text-danger"></i>
        <h4 class="card-title mt-3">Access Denied</h4>
        <p class="card-text text-muted">
          <template v-if="deniedEmail">The account {{ deniedEmail }} doesn't</template>
          <template v-else>This account doesn't</template>
          have access to Distill. If this is a mistake, ask the site owner to add your account.
          You've been signed out.
        </p>
        <router-link class="btn btn-outline-secondary" to="/login">Back to Log In</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'vAccessDenied',
  setup() {
    const route = useRoute()
    const deniedEmail = computed(() => route.query.email || '')

    return { deniedEmail }
  },
}
</script>
<style scoped></style>
