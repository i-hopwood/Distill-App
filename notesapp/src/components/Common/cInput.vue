<template>
  <div>
    <label v-if="label && label.length > 0" :for="elId" class="input-label">
      {{ label }}
    </label>

    <div class="input-group input-group-sm">
      <textarea
        v-if="props.type === 'text-area'"
        class="form-control"
        rows="6"
        v-model="props.modelValue.$model"
        :placeholder="placeholder"
        :id="elId"
        @blur="props.blurEvent"
        @keydown="handleKeydown"
        :name="elId"
      ></textarea>
      <input
        v-else
        class="form-control"
        :type="type"
        v-model="props.modelValue.$model"
        :placeholder="placeholder"
        :id="elId"
        @blur="props.blurEvent"
        autocomplete="elId"
        :name="elId"
      />
      <span
        class="input-group-text"
        v-if="props.type === 'date' || props.type == 'time'"
        :id="'clear-input_' + elId"
        @click="clearInput()"
        ><i class="bi bi-x-circle"></i
      ></span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'cInput',
  props: {
    modelValue: { default: null, type: Object },
    type: { default: 'text', type: String },
    label: { default: '', type: String },
    placeholder: { default: '', type: String },
    elementId: { default: '', type: String },
    blurEvent: { default: null, type: Function },
  },
  emits: ['enter'],
  setup(props, { emit }) {
    const clearInput = () => {
      props.modelValue.$model = null
    }

    const handleKeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        emit('enter')
      }
    }

    const elId = computed(() => {
      if (props.elementId.length > 0) return props.elementId
      let result = ''
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let charactersLength = characters.length
      for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    })

    const label = computed(() => props.label)

    return {
      clearInput,
      handleKeydown,
      elId,
      label,
      props,
    }
  },
}
</script>

<style></style>
