<template>
  <button
    class="btn btn-primary btn-sm"
    data-bs-toggle="modal"
    data-bs-target="#newNoteModal"
    aria-label="New Note"
    title="New Note"
  >
    <i class="bi bi-plus-lg"></i>
  </button>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'cAddNote',
  components: {},
  setup() {
    onMounted(() => {})

    return {}
  },
}
</script>
<style scoped></style>
