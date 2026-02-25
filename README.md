# vue-directive

A collection of Vue 3 custom directives

## Installation

```bash
npm i vue-directive
# or
pnpm add vue-directive
```

## Getting Started

### Global Registration

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { throttleClick } from 'vue-directive'

const app = createApp(App)
app.directive('throttle-click', throttleClick)
app.mount('#app')
```

### On-demand Import

```ts
import { throttleClick } from 'vue-directive'
```

---

## Directives

### `v-throttle-click` — Throttled Click

Throttles click events to prevent repeated triggers within a short period. Supports custom delay, async lock, trailing call, and Vue modifier pass-through.

#### Basic Usage

```vue
<!-- Default throttle interval: 300ms -->
<button v-throttle-click="handleClick">Submit</button>

<!-- Custom interval (in ms) -->
<button v-throttle-click:500="handleClick">Submit</button>

<!-- Interval 0: no throttle, modifiers still apply -->
<button v-throttle-click:0="handleClick">Submit</button>
```

#### Modifiers

| Modifier | Description |
|----------|-------------|
| `.once` | Fire only once; all subsequent clicks are ignored |
| `.trailing` | If a click is blocked during cooldown, it fires once after the cooldown ends |
| `.async` | Async mode: new clicks are blocked until the previous callback's Promise resolves/rejects |
| `.right` | Listen to `contextmenu` (right-click) instead of `click` |
| `.capture` | Use capture phase for the event listener |
| `.passive` | Use passive listener mode for better scroll performance |
| `.stop` | Stop event propagation (passed to Vue's `withModifiers`) |
| `.prevent` | Prevent default behavior (passed to Vue's `withModifiers`) |
| `.self` | Only trigger when the event target is the element itself |

#### Examples

```vue
<script setup lang="ts">
async function submitForm() {
  await fetch('/api/submit', { method: 'POST' })
}
</script>

<template>
  <!-- Async + trailing: blocks repeated clicks during async call,
       fires the last blocked click after the call completes -->
  <button v-throttle-click:1000.async.trailing="submitForm">
    Submit
  </button>

  <!-- Fire once only -->
  <button v-throttle-click.once="handleClick">Click once</button>

  <!-- Throttle right-click -->
  <div v-throttle-click.right="openMenu">Right-click area</div>
</template>
```

#### Callback Signature

```ts
type ClickHandler = (event: MouseEvent, ...args: unknown[]) => any
```

The binding value receives a `MouseEvent` as the first argument:

```ts
function handleClick(e: MouseEvent) {
  console.log('clicked', e)
}
```

In async mode, return a `Promise` to activate the async lock:

```ts
async function handleAsync(e: MouseEvent) {
  await fetch('/api/submit', { method: 'POST' })
}
```
