<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>Distill</strong> by Iain Hopwood. The source code is licensed
        <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
      </p>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'cFooter',
  components: {},
  setup() {
    onMounted(() => {})

    return {}
  },
}
</script>
<style scoped></style>
