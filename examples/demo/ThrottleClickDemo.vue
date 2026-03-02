<script lang="ts" setup>
import { ref } from 'vue';

const count = ref(0);

const log = (msg: string) => {
  count.value += 1;
  console.log(msg, count.value);
};


const asyncLog = async (msg: string) => {
  log(msg);
  await new Promise((resolve) => setTimeout(resolve, 2000));
};
</script>

<template>
  <div class="dev-app">
    <h2>v-throttle-click 示例</h2>
    <p>点击次数: {{ count }}</p>

    <section>
      <h3>基础用法（默认 300ms）</h3>
      <button v-throttle-click="() => log('throttle')">节流点击</button>
    </section>

    <section>
      <h3>.once</h3>
      <button v-throttle-click.once="() => log('once')">只触发一次</button>
    </section>

    <section>
      <h3>自定义间隔：2000（2 秒）</h3>
      <button v-throttle-click:2000="() => log('2s')">2 秒节流</button>
    </section>

    <section>
      <h3>async 模式</h3>
      <button v-throttle-click.async="() => asyncLog('async')">async 节流</button>
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

