<template>
  <div class="container">
    <cLogin ref="child" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import cLogin from '@/components/Auth/cLogin.vue'

export default {
  name: 'vLogin',
  components: {
    cLogin,
  },
  setup() {
    const child = ref(null)

    onMounted(() => {})

    return { child }
  },
}
</script>
<style scoped></style>
