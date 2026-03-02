<script lang="ts" setup>
import { ref } from 'vue';

const count = ref(0);

const log = (msg: string) => {
  count.value += 1;
  console.log(msg, count.value);
};
</script>

<template>
  <div class="dev-app">
    <h2>v-debounce-click 示例</h2>
    <p>点击次数: {{ count }}</p>

    <section>
      <h3>基础用法（默认 300ms，trailing）</h3>
      <button v-debounce-click="() => log('debounce')">防抖点击</button>
    </section>

    <section>
      <h3>.leading（立即触发，不在尾部触发）</h3>
      <button v-debounce-click.leading="() => log('leading')">
        leading 防抖
      </button>
    </section>

    <section>
      <h3>自定义延迟：1000（1 秒）</h3>
      <button v-debounce-click:1000="() => log('1s')">1 秒防抖</button>
    </section>
  </div>
</template>

<style scoped>
.dev-app {
  font-family: system-ui, sans-serif;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
h2 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}
h3 {
  font-size: 0.95rem;
  margin: 0.75rem 0 0.25rem;
}
button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>

