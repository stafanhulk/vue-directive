# v-throttle-click

Throttles click events to prevent repeated triggers within a short period. Supports custom delay, async lock, trailing call, and Vue modifier pass-through.

## Installation

```ts
// Global registration (all directives)
import { createApp } from 'vue'
import VuseDirective from 'vuse-directive'

const app = createApp(App)
app.use(VuseDirective)
app.mount('#app')
```

```ts
// Single directive registration
import { createApp } from 'vue'
import { throttleClick } from 'vuse-directive'

const app = createApp(App)
app.directive('throttle-click', throttleClick)
app.mount('#app')
```

```ts
// On-demand import (local registration)
import { throttleClick } from 'vuse-directive'
```

## Basic Usage

```vue
<!-- Default throttle interval: 300ms -->
<button v-throttle-click="handleClick">Submit</button>

<!-- Custom interval (in ms) -->
<button v-throttle-click:500="handleClick">Submit</button>

<!-- Interval 0: no throttle, modifiers still apply -->
<button v-throttle-click:0="handleClick">Submit</button>
```

## Arg

| Arg        | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| _(omitted)_ | Default throttle interval: `300` ms                                        |
| `0`        | Disable throttle; callback fires on every click, modifiers still apply      |
| _number_   | Custom throttle interval in milliseconds (e.g. `:500` → 500 ms)            |

## Modifiers

### Throttle-specific

| Modifier   | Description                                                                                     |
|------------|-------------------------------------------------------------------------------------------------|
| `.once`    | Fire only once; all subsequent clicks are ignored                                               |
| `.trailing`| If a click is blocked during cooldown, re-fire once after cooldown (or async call) ends         |
| `.async`   | Async mode: new clicks are blocked until the previous callback's Promise resolves/rejects       |

### Event listener

| Modifier   | Description                                                   |
|------------|---------------------------------------------------------------|
| `.right`   | Listen to `contextmenu` (right-click) instead of `click`     |
| `.capture` | Use capture phase for the event listener                      |
| `.passive` | Mark the listener as passive for better scroll performance    |

### Vue `withModifiers` pass-through

| Modifier  | Description                                                               |
|-----------|---------------------------------------------------------------------------|
| `.stop`   | Call `event.stopPropagation()`                                            |
| `.prevent`| Call `event.preventDefault()`                                             |
| `.self`   | Only trigger when `event.target` is the element itself                    |
| `.ctrl`   | Only trigger when the Ctrl key is held                                    |
| `.shift`  | Only trigger when the Shift key is held                                   |
| `.alt`    | Only trigger when the Alt / Option key is held                            |
| `.meta`   | Only trigger when the Meta / Command key is held                          |
| `.left`   | Only trigger on left mouse button clicks                                  |
| `.middle` | Only trigger on middle mouse button clicks                                |
| `.exact`  | Only trigger when exactly the specified modifier keys are pressed         |

## Callback Signature

```ts
type ClickHandler = (event: MouseEvent, ...args: unknown[]) => any
```

The binding value receives a `MouseEvent` as the first argument.

In async mode, return a `Promise` to activate the async lock:

```ts
async function handleAsync(e: MouseEvent) {
  await fetch('/api/submit', { method: 'POST' })
}
```

## Behavior Details

### Default (trailing only)

On each click the handler fires immediately. Subsequent clicks within the cooldown window are dropped.

```
click ──── click ──── click ──── [cooldown ends]
  ↓ fire    (drop)    (drop)
```

### `.trailing`

If any click is blocked during the cooldown, the handler re-fires once when the cooldown ends, using the most recent blocked event.

```
click ──── click ──── click ──── [cooldown ends]
  ↓ fire   (save)     (save)         ↓ fire (last saved)
```

### `.async`

New clicks are blocked while the previous call's Promise is pending. The cooldown timer does not apply in async mode; the lock releases only when the Promise settles.

```
click ──── click ──── [Promise resolves]
  ↓ fire   (block)         ↓ unlocked
```

### `.async.trailing`

Same as `.async`, but if any click was blocked while the Promise was pending, the handler re-fires automatically after the Promise settles.

```
click ──── click ──── [Promise resolves]
  ↓ fire   (save)          ↓ fire (saved event)
```

### `.once`

The handler fires at most once for the lifetime of the element. All later clicks are silently ignored.

## Examples

```vue
<script setup lang="ts">
async function submitForm() {
  await fetch('/api/submit', { method: 'POST' })
}

function handleClick(e: MouseEvent) {
  console.log('clicked', e)
}
</script>

<template>
  <!-- Basic: 300ms throttle -->
  <button v-throttle-click="handleClick">Click me</button>

  <!-- Custom interval: 1000ms -->
  <button v-throttle-click:1000="handleClick">1s throttle</button>

  <!-- Async + trailing: blocks repeated clicks during async call,
       fires the last blocked click after the call completes -->
  <button v-throttle-click.async.trailing="submitForm">Submit</button>

  <!-- Fire once only -->
  <button v-throttle-click.once="handleClick">Click once</button>

  <!-- Throttle right-click -->
  <div v-throttle-click.right="openMenu">Right-click area</div>

  <!-- Stop propagation -->
  <button v-throttle-click.stop="handleClick">No bubble</button>
</template>
```
