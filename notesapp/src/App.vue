<template>
  <cHeader />
  <main class="container">
    <RouterView />
  </main>
  <cFooter />
</template>

<script>
import cHeader from '@/components/App/cHeader.vue'
import cFooter from '@/components/App/cFooter.vue'

export default {
  name: 'App',
  components: { cHeader, cFooter },
  setup() {},
}
</script>

<style scoped></style>
