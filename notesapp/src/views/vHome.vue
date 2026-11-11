<template>
  <div class="container">
    <cNewNote @addNote="child.addNote($event)" />
    <cNotesList ref="child" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

import cNotesList from '@/components/Notes/cNotesList.vue'
import cNewNote from '@/components/Notes/cNewNote.vue'

export default {
  name: 'Home',
  components: {
    cNotesList,

    cNewNote,
  },
  setup() {
    const child = ref(null)

    onMounted(() => {})

    return { child }
  },
}
</script>
<style scoped></style>
