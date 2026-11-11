<template>
  <div class="modal" id="newNoteModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add Note</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <cInput v-model="noteDetails" type="text-area" label="Add Note" @enter="submitNote" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="submitNote">Add Note</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import cInput from '@/components/Common/cInput.vue'

export default {
  name: 'cNewNote',
  components: {
    cInput,
  },
  emits: ['addNote'],
  setup(props, { emit }) {
    const noteDetails = ref({ $model: '' })

    const submitNote = () => {
      const text = noteDetails.value.$model
      if (!text || !text.trim()) return

      emit('addNote', text)
      noteDetails.value.$model = ''

      const modalEl = document.getElementById('newNoteModal')
      Modal.getOrCreateInstance(modalEl).hide()
    }

    return { noteDetails, submitNote }
  },
}
</script>
<style scoped></style>
