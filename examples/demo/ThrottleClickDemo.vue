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

const tableData = ref([
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
])

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}

const vTest = {
  created(el: HTMLElement) {
    console.log('[lwb]', el);
  },
  mounted(el: HTMLElement) {
    console.log('[lwb]', el);
  },
}
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
    <el-table :data="tableData" style="width: 100%" max-height="250">
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default="scope">
          <el-button v-throttle-click="() => deleteRow(scope.row.id)" link type="primary" size="small">
            Remove
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
