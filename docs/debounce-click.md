# v-debounce-click

Debounces click events so the handler fires only after the user stops clicking for a specified duration. Supports custom delay, leading mode, max-wait cap, and Vue modifier pass-through.

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
import { debounceClick } from 'vuse-directive'

const app = createApp(App)
app.directive('debounce-click', debounceClick)
app.mount('#app')
```

```ts
// On-demand import (local registration)
import { debounceClick } from 'vuse-directive'
```

## Basic Usage

```vue
<!-- Default debounce delay: 300ms (trailing) -->
<button v-debounce-click="handleClick">Search</button>

<!-- Custom delay (in ms) -->
<button v-debounce-click:500="handleClick">Search</button>

<!-- Delay 0: no debounce, fires on every click -->
<button v-debounce-click:0="handleClick">Search</button>
```

## Arg

| Arg         | Description                                                                      |
|-------------|----------------------------------------------------------------------------------|
| _(omitted)_ | Default debounce delay: `300` ms                                                 |
| `0`         | Disable debounce; callback fires on every click, modifiers still apply           |
| _number_    | Custom debounce delay in milliseconds (e.g. `:500` → 500 ms)                    |

## Modifiers

### Debounce-specific

| Modifier   | Description                                                                                                          |
|------------|----------------------------------------------------------------------------------------------------------------------|
| `.leading` | Fire immediately on the first click of a debounce period; also fire trailing if more clicks happen during the delay |
| `.once`    | Fire only once for the lifetime of the element; all subsequent clicks are ignored                                    |

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
type ClickHandler = (event: MouseEvent, ...args: unknown[]) => void
```

The binding value receives a `MouseEvent` as the first argument:

```ts
function handleClick(e: MouseEvent) {
  console.log('clicked', e)
}
```

## Behavior Details

### Default (trailing)

The handler fires once after the user stops clicking for the full delay duration. Every new click resets the timer.

```
click ── click ── click ── [silence 300ms]
                               ↓ fire
```

### `.leading`

The handler fires immediately on the **first** click of a debounce period. If more clicks occur during the delay, a trailing call is also made when the delay ends. If no clicks happen during the delay, no trailing call is made.

```
// With subsequent clicks:
click ── click ── [delay ends]
  ↓ fire  (wait)     ↓ fire (trailing)

// Without subsequent clicks:
click ── [delay ends]
  ↓ fire   (no trailing)
```

### `.once`

The handler fires at most once for the lifetime of the element. All later clicks are silently ignored.

## Max-Wait Cap (`makeDebounceClick`)

The default `v-debounce-click` directive has no max-wait limit. If the user never stops clicking, the handler will never fire.

To set a max-wait cap — guaranteeing the handler fires at least once even during continuous clicks — use `makeDebounceClick`:

```ts
import { makeDebounceClick } from 'vuse-directive'

// Creates a directive that fires at most every 3000ms even if clicks never stop
const debounceClickWithMaxWait = makeDebounceClick(3000)
```

Register and use it like any custom directive:

```ts
// Local registration
app.directive('debounce-click-capped', debounceClickWithMaxWait)
```

```vue
<button v-debounce-click-capped:500="handleClick">Search</button>
```

### `makeDebounceClick(maxWait)` parameter

| Value      | Description                                        |
|------------|----------------------------------------------------|
| `> 0`      | Enable max-wait: force-fire after `maxWait` ms     |
| `<= 0`     | Disable max-wait (same as the default directive)   |

The default exported `debounceClick` is equivalent to `makeDebounceClick(-1)`.

## Examples

```vue
<script setup lang="ts">
function search(e: MouseEvent) {
  console.log('search triggered', e)
}
</script>

<template>
  <!-- Basic: fires 300ms after the last click -->
  <button v-debounce-click="search">Search</button>

  <!-- Custom delay: fires 1000ms after the last click -->
  <button v-debounce-click:1000="search">Search (1s)</button>

  <!-- Leading: fires immediately on first click, trailing if more clicks follow -->
  <button v-debounce-click.leading="search">Search (leading)</button>

  <!-- Once: fires only the first time ever -->
  <button v-debounce-click.once="search">Search (once)</button>

  <!-- Debounce right-click -->
  <div v-debounce-click.right="openMenu">Right-click area</div>

  <!-- Stop propagation -->
  <button v-debounce-click.stop="search">No bubble</button>
</template>
```

### With max-wait cap

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { makeDebounceClick } from 'vuse-directive'

const app = createApp(App)
app.directive('debounce-click', makeDebounceClick(3000))
app.mount('#app')
```

```vue
<!-- Fires after 500ms of silence, but guaranteed to fire within 3000ms
     even if the user keeps clicking without stopping -->
<button v-debounce-click:500="search">Search</button>
```
