<script lang="ts" setup>
import DebounceClickDemo from './demo/DebounceClickDemo.vue';
import ThrottleClickDemo from './demo/ThrottleClickDemo.vue';
</script>

<template>
  <div class="dev-root">
    <h1>Vue Directive 示例</h1>
    <ThrottleClickDemo />
    <DebounceClickDemo />
  </div>
</template>

<style scoped>
.dev-root {
  padding: 1rem;
  max-width: 720px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
</style>
