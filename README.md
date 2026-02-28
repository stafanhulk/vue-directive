# vue-directive

A collection of Vue 3 custom directives

## Installation

```bash
npm install vuse-directive
# or
pnpm add vuse-directive
# or
yarn add vuse-directive
```

## Getting Started

### Global Registration

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { throttleClick } from 'vuse-directive'

const app = createApp(App)
app.directive('throttle-click', throttleClick)
app.mount('#app')
```

### On-demand Import

```ts
import { throttleClick } from 'vuse-directive'
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

#### Arg

| Arg | Description |
|-----|-------------|
| _(omitted)_ | Default throttle interval: `300` ms |
| `0` | Disable throttle; callback fires on every click, modifiers still apply |
| _number_ | Custom throttle interval in milliseconds (e.g. `:500` → 500 ms) |

#### Modifiers

**Throttle-specific modifiers**

| Modifier | Description |
|----------|-------------|
| `.once` | Fire only once; all subsequent clicks are ignored |
| `.trailing` | If a click is blocked during cooldown, re-fire once after the cooldown (or async call) ends |
| `.async` | Async mode: new clicks are blocked until the previous callback's Promise resolves/rejects |

**Event listener modifiers**

| Modifier | Description |
|----------|-------------|
| `.right` | Listen to `contextmenu` (right-click) instead of `click` |
| `.capture` | Use capture phase for the event listener |
| `.passive` | Mark the listener as passive for better scroll performance |

**Vue `withModifiers` pass-through**

| Modifier | Description |
|----------|-------------|
| `.stop` | Call `event.stopPropagation()` |
| `.prevent` | Call `event.preventDefault()` |
| `.self` | Only trigger when `event.target` is the element itself |
| `.ctrl` | Only trigger when the Ctrl key is held |
| `.shift` | Only trigger when the Shift key is held |
| `.alt` | Only trigger when the Alt / Option key is held |
| `.meta` | Only trigger when the Meta / Command key is held |
| `.left` | Only trigger on left mouse button clicks |
| `.middle` | Only trigger on middle mouse button clicks |
| `.exact` | Only trigger when exactly the specified modifier keys are pressed (no others) |

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
