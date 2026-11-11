<template>
  <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
    <button
      class="btn btn-sm btn-outline-secondary"
      :aria-label="filtersVisible ? 'Hide Filters' : 'Show Filters'"
      :title="filtersVisible ? 'Hide Filters' : 'Show Filters'"
      @click="filtersVisible = !filtersVisible"
    >
      <i class="bi" :class="filtersVisible ? 'bi-funnel-fill' : 'bi-funnel'"></i>
    </button>

    <select
      class="form-select form-select-sm flex-shrink-1"
      style="width: auto; max-width: 140px"
      v-model="sortBy"
      aria-label="Sort notes"
    >
      <option v-for="option in sortOptions" :key="option.id" :value="option.id">
        {{ option.display }}
      </option>
    </select>

    <cAddNote />
  </div>

  <header v-if="filtersVisible" class="p-3 mb-3 bg-body-tertiary border rounded">
    <div class="row g-3 align-items-end">
      <div class="col-12 col-md-6">
        <label for="searchQuery" class="form-label small text-muted mb-1">Search</label>
        <input
          id="searchQuery"
          type="search"
          class="form-control form-control-sm"
          placeholder="Search notes..."
          v-model="searchQuery"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <label for="categoryFilter" class="form-label small text-muted mb-1">Category</label>
        <select id="categoryFilter" class="form-select form-select-sm" v-model="categoryFilter">
          <option v-for="category in noteCategories" :key="category.id" :value="category.id">
            {{ category.display }}
          </option>
        </select>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <label for="priorityFilter" class="form-label small text-muted mb-1">Priority</label>
        <select id="priorityFilter" class="form-select form-select-sm" v-model="priorityFilter">
          <option v-for="priority in priorityFilters" :key="priority.id" :value="priority.id">
            {{ priority.display }}
          </option>
        </select>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <label for="dateFilter" class="form-label small text-muted mb-1">Date Added</label>
        <select id="dateFilter" class="form-select form-select-sm" v-model="dateFilter">
          <option v-for="date in dateFilters" :key="date.id" :value="date.id">
            {{ date.display }}
          </option>
        </select>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="reviewedFilter"
            v-model="reviewedFilter"
          />
          <label class="form-check-label small" for="reviewedFilter">Not Yet Reviewed</label>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="showCompleted"
            v-model="showCompleted"
          />
          <label class="form-check-label small" for="showCompleted">Show Completed</label>
        </div>
      </div>

      <div class="col-12">
        <button
          class="btn btn-sm btn-outline-secondary"
          aria-label="Clear Filters"
          title="Clear Filters"
          @click="clearFilters"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </header>

  <div class="row g-2">
    <div v-for="note in sortedNotes" :key="note.noteId" class="col-12 col-md-6 col-xl-4">
      <cNote :noteDetails="note" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted, watch } from 'vue'
import cNote from '@/components/Notes/cNote.vue'
import cAddNote from './cAddNote.vue'
import { useAuth } from '@/composables/useAuth'
import { subscribeToUserNotes, addNote as createNote } from '@/services/notesService'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const DATE_BUCKETS = [
  { id: 'week', display: 'Less than a week old', matches: (age) => age <= 7 },
  { id: 'month', display: '1 week - 1 month old', matches: (age) => age > 7 && age <= 30 },
  { id: 'over-month', display: 'Over a month old', matches: (age) => age > 30 },
]

const SORT_OPTIONS = [
  { id: 'date-desc', display: 'Newest First' },
  { id: 'date-asc', display: 'Oldest First' },
  { id: 'priority-desc', display: 'Priority (High to Low)' },
  { id: 'category-asc', display: 'Category (A-Z)' },
]

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1, '': 0 }

export default {
  name: 'cNotesList',
  components: {
    cNote,
    cAddNote,
  },
  setup() {
    const noteList = ref([])
    const { currentUser } = useAuth()
    let unsubscribeNotes = null

    const subscribe = (userId) => {
      if (unsubscribeNotes) unsubscribeNotes()

      if (!userId) {
        noteList.value = []
        return
      }

      unsubscribeNotes = subscribeToUserNotes(userId, (notes) => {
        noteList.value = notes
      })
    }

    watch(() => currentUser.value?.uid, subscribe, { immediate: true })

    onUnmounted(() => {
      if (unsubscribeNotes) unsubscribeNotes()
    })

    const categoryFilter = ref('')
    const priorityFilter = ref('')
    const dateFilter = ref('')
    const reviewedFilter = ref(false)
    const showCompleted = ref(false)
    const searchQuery = ref('')
    const filtersVisible = ref(false)
    const sortBy = ref('date-desc')

    const noteAgeInDays = (note) => {
      const created = new Date(note.noteCreatedDate)
      return (Date.now() - created.getTime()) / MS_PER_DAY
    }

    const matchesCategoryFilter = (note) =>
      !categoryFilter.value || note.noteAICategory === categoryFilter.value

    const matchesPriorityFilter = (note) =>
      !priorityFilter.value || note.noteAIPriority === priorityFilter.value

    const matchesDateFilter = (note) => {
      if (!dateFilter.value) return true
      const bucket = DATE_BUCKETS.find((b) => b.id === dateFilter.value)
      return bucket ? bucket.matches(noteAgeInDays(note)) : true
    }

    const matchesActiveFilter = (note) => showCompleted.value || note.noteIsActive !== false

    const matchesReviewedFilter = (note) => !reviewedFilter.value || note.noteAIReviewed !== true

    const matchesSearchFilter = (note) => {
      if (!searchQuery.value.trim()) return true
      const q = searchQuery.value.trim().toLowerCase()
      return (
        (note.noteDetails || '').toLowerCase().includes(q) ||
        (note.noteAITitle || '').toLowerCase().includes(q) ||
        (note.noteAIDetails || '').toLowerCase().includes(q)
      )
    }

    const filteredNotes = computed(() => {
      return noteList.value.filter(
        (note) =>
          matchesActiveFilter(note) &&
          matchesCategoryFilter(note) &&
          matchesPriorityFilter(note) &&
          matchesDateFilter(note) &&
          matchesReviewedFilter(note) &&
          matchesSearchFilter(note),
      )
    })

    const sortedNotes = computed(() => {
      const notes = [...filteredNotes.value]

      switch (sortBy.value) {
        case 'date-asc':
          return notes.sort((a, b) => new Date(a.noteCreatedDate) - new Date(b.noteCreatedDate))
        case 'priority-desc':
          return notes.sort(
            (a, b) =>
              (PRIORITY_RANK[b.noteAIPriority] || 0) - (PRIORITY_RANK[a.noteAIPriority] || 0),
          )
        case 'category-asc':
          return notes.sort((a, b) =>
            (a.noteAICategory || '').localeCompare(b.noteAICategory || ''),
          )
        case 'date-desc':
        default:
          return notes.sort((a, b) => new Date(b.noteCreatedDate) - new Date(a.noteCreatedDate))
      }
    })

    const noteCategories = computed(() => {
      const relevant = noteList.value.filter(
        (note) =>
          matchesActiveFilter(note) &&
          matchesPriorityFilter(note) &&
          matchesDateFilter(note) &&
          matchesReviewedFilter(note) &&
          matchesSearchFilter(note),
      )
      const unique = [...new Set(relevant.map((note) => note.noteAICategory).filter(Boolean))]

      return [
        { id: '', display: 'No Filter' },
        ...unique.map((item) => ({ id: item, display: item })),
      ]
    })

    const priorityFilters = computed(() => {
      const relevant = noteList.value.filter(
        (note) =>
          matchesActiveFilter(note) &&
          matchesCategoryFilter(note) &&
          matchesDateFilter(note) &&
          matchesReviewedFilter(note) &&
          matchesSearchFilter(note),
      )
      const unique = [...new Set(relevant.map((note) => note.noteAIPriority).filter(Boolean))]

      return [
        { id: '', display: 'No Filter' },
        ...unique.map((item) => ({ id: item, display: item })),
      ]
    })

    const dateFilters = computed(() => {
      const relevant = noteList.value.filter(
        (note) =>
          matchesActiveFilter(note) &&
          matchesCategoryFilter(note) &&
          matchesPriorityFilter(note) &&
          matchesReviewedFilter(note) &&
          matchesSearchFilter(note),
      )

      const availableBuckets = DATE_BUCKETS.filter((bucket) =>
        relevant.some((note) => bucket.matches(noteAgeInDays(note))),
      )

      return [
        { id: '', display: 'No Filter' },
        ...availableBuckets.map((bucket) => ({ id: bucket.id, display: bucket.display })),
      ]
    })

    const clearFilters = () => {
      categoryFilter.value = ''
      priorityFilter.value = ''
      dateFilter.value = ''
      reviewedFilter.value = false
      showCompleted.value = false
      searchQuery.value = ''
    }

    const addNote = async (noteText) => {
      if (!currentUser.value) return
      await createNote(currentUser.value.uid, noteText)
    }

    return {
      noteList,
      filteredNotes,
      sortedNotes,
      sortBy,
      sortOptions: SORT_OPTIONS,
      noteCategories,
      categoryFilter,
      priorityFilters,
      priorityFilter,
      dateFilter,
      dateFilters,
      reviewedFilter,
      showCompleted,
      searchQuery,
      filtersVisible,
      clearFilters,
      addNote,
    }
  },
}
</script>
