<template>
  <div class="card mb-2 h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <h5 class="card-title mb-0 text-truncate note-title">{{ headerTitle }}</h5>
        <div class="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
          <span v-if="noteDetails.noteAIReviewed" class="badge" :class="priorityBadgeClass">{{
            noteDetails.noteAIPriority
          }}</span>
          <button
            class="btn btn-sm btn-link p-0 text-decoration-none"
            :aria-label="detailsExpanded ? 'Collapse details' : 'Expand details'"
            @click="detailsExpanded = !detailsExpanded"
          >
            <i class="bi" :class="detailsExpanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>
        </div>
      </div>
      <h6 v-if="noteDetails.noteAIReviewed" class="card-subtitle mb-0 mt-1 text-muted">
        {{ noteDetails.noteAICategory }}
      </h6>

      <template v-if="detailsExpanded">
        <template v-if="noteDetails.noteAIReviewed">
          <p class="card-text mt-2">{{ noteDetails.noteAIDetails }}</p>

          <button
            class="btn btn-sm btn-outline-secondary"
            :aria-label="showOriginal ? 'Hide original' : 'Show original'"
            :title="showOriginal ? 'Hide original' : 'Show original'"
            @click="showOriginal = !showOriginal"
          >
            <i class="bi" :class="showOriginal ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
          <p v-if="showOriginal" class="card-text text-muted mt-2 border-top pt-2">
            {{ noteDetails.noteDetails }}
          </p>
        </template>

        <template v-else>
          <p class="card-text mt-2">{{ noteDetails.noteDetails }}</p>
        </template>
      </template>

      <div class="d-flex justify-content-between align-items-center mt-2">
        <small class="text-muted">Added {{ formattedDate }}</small>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-outline-secondary"
            data-bs-toggle="modal"
            :data-bs-target="'#' + editModalId"
            aria-label="Edit"
            title="Edit"
          >
            <i class="bi bi-pencil"></i>
          </button>
          <button
            v-if="noteDetails.noteIsActive"
            class="btn btn-sm btn-success"
            data-bs-toggle="modal"
            :data-bs-target="'#' + completeModalId"
            aria-label="Mark Completed"
            title="Mark Completed"
          >
            <i class="bi bi-check-lg"></i>
          </button>
          <button
            v-else
            class="btn btn-sm btn-outline-success"
            aria-label="Reopen"
            title="Reopen"
            @click="reopen"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="modal" :id="completeModalId" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Mark as Completed?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">
              Are you sure you want to mark this note as completed? It will be removed from your
              active list.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="confirmComplete">
              Yes, Mark Completed
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" :id="editModalId" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Note</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted small">
              Editing resets the AI title/summary/priority - the poller will reprocess it.
            </p>
            <cInput v-model="editText" type="text-area" label="Note" @enter="submitEdit" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="submitEdit">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import cInput from '@/components/Common/cInput.vue'
import { markNoteCompleted, reopenNote, editNote } from '@/services/notesService'

export default {
  name: 'cNote',
  props: {
    noteDetails: { default: () => ({}), type: Object },
  },
  components: { cInput },
  setup(props) {
    const noteDetails = ref({
      noteId: '',
      noteDetails: '',
      noteCreatedDate: '',
      noteUpdatedDate: '',
      noteIsActive: true,
      noteAIReviewed: false,
      noteAIPriority: '',
      noteAITitle: '',
      noteAIDetails: '',
      noteAICategory: '',
    })

    const showOriginal = ref(false)
    const detailsExpanded = ref(false)
    const editText = ref({ $model: '' })

    const completeModalId = computed(() => `completeModal_${props.noteDetails.noteId}`)
    const editModalId = computed(() => `editModal_${props.noteDetails.noteId}`)

    const headerTitle = computed(() =>
      noteDetails.value.noteAIReviewed ? noteDetails.value.noteAITitle : noteDetails.value.noteDetails,
    )

    const priorityBadgeClass = computed(() => {
      const classes = {
        High: 'text-bg-danger',
        Medium: 'text-bg-warning',
        Low: 'text-bg-success',
      }
      return classes[noteDetails.value.noteAIPriority] || 'text-bg-secondary'
    })

    const formattedDate = computed(() => {
      if (!noteDetails.value.noteCreatedDate) return ''
      return new Date(noteDetails.value.noteCreatedDate).toLocaleDateString()
    })

    // Close the modal immediately (synchronously, like the "Add Note" flow) rather than
    // waiting on the Firestore write first. The live notes subscription in cNotesList
    // removes this note from the list on its own once the write is confirmed - if we wait
    // here too, the subscription can unmount this component (and its modal) mid-transition,
    // leaving Bootstrap's backdrop/body cleanup stuck (dimmed screen, page unclickable).
    const confirmComplete = () => {
      const modalEl = document.getElementById(completeModalId.value)
      if (modalEl) Modal.getOrCreateInstance(modalEl).hide()

      markNoteCompleted(props.noteDetails.noteId).catch((err) => {
        console.error('Failed to mark note completed:', err)
        alert('Could not mark this note as completed. Please try again.')
      })
    }

    const reopen = () => {
      reopenNote(props.noteDetails.noteId).catch((err) => {
        console.error('Failed to reopen note:', err)
        alert('Could not reopen this note. Please try again.')
      })
    }

    const submitEdit = () => {
      const text = editText.value.$model
      if (!text || !text.trim()) return

      const modalEl = document.getElementById(editModalId.value)
      if (modalEl) Modal.getOrCreateInstance(modalEl).hide()

      editNote(props.noteDetails.noteId, text).catch((err) => {
        console.error('Failed to edit note:', err)
        alert('Could not save your edit. Please try again.')
      })
    }

    onMounted(() => {
      if (props.noteDetails) {
        noteDetails.value = props.noteDetails
        editText.value.$model = props.noteDetails.noteDetails
      }
    })

    watch(
      () => props.noteDetails.noteDetails,
      (text) => {
        editText.value.$model = text
      },
    )

    return {
      noteDetails,
      showOriginal,
      detailsExpanded,
      editText,
      headerTitle,
      priorityBadgeClass,
      formattedDate,
      completeModalId,
      editModalId,
      confirmComplete,
      reopen,
      submitEdit,
    }
  },
}
</script>
<style scoped>
.note-title {
  font-size: clamp(0.95rem, 0.8rem + 0.6vw, 1.25rem);
}
</style>
