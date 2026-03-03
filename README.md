# vuse-directive

A collection of Vue 3 custom directives.

## Installation

```bash
npm install vuse-directive
# or
pnpm add vuse-directive
# or
yarn add vuse-directive
```

## Getting Started

### Plugin (register all directives globally)

```ts
import { createApp } from 'vue'
import App from './App.vue'
import VuseDirective from 'vuse-directive'

const app = createApp(App)
app.use(VuseDirective)
app.mount('#app')
```

### Single directive

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { throttleClick, debounceClick } from 'vuse-directive'

const app = createApp(App)
app.directive('throttle-click', throttleClick)
app.directive('debounce-click', debounceClick)
app.mount('#app')
```

### On-demand import (local registration)

```ts
import { throttleClick, debounceClick } from 'vuse-directive'
```

---

## Directives


| Directive          | Description                                                                    | Docs |
| ------------------ | ------------------------------------------------------------------------------ | ---- |
| `v-throttle-click` | Throttle click events — fires immediately, then locks for a cooldown period    |      |
| `v-debounce-click` | Debounce click events — fires after the user stops clicking for a set duration |      |


---

## `v-throttle-click`

Fires immediately on click, then ignores subsequent clicks until the cooldown ends.

```vue
<!-- Default: 300ms cooldown -->
<button v-throttle-click="handleClick">Submit</button>

<!-- Custom cooldown -->
<button v-throttle-click:1000="handleClick">Submit</button>

<!-- Async lock: blocks until the returned Promise settles -->
<button v-throttle-click.async="submitForm">Submit</button>

<!-- Async + trailing: re-fires the last blocked click after the Promise settles -->
<button v-throttle-click.async.trailing="submitForm">Submit</button>
```

**Key modifiers:** `.once` · `.trailing` · `.async` · `.right` · `.stop` · `.prevent`

---

## `v-debounce-click`

Fires after the user stops clicking for the specified delay (trailing by default).

```vue
<!-- Default: fires 300ms after the last click -->
<button v-debounce-click="handleClick">Search</button>

<!-- Custom delay -->
<button v-debounce-click:500="handleClick">Search</button>

<!-- Leading: fires immediately on first click, trailing if more clicks follow -->
<button v-debounce-click.leading="handleClick">Search</button>
```

**Key modifiers:** `.once` · `.leading` · `.right` · `.stop` · `.prevent`

### Max-wait cap

By default there is no max-wait limit. Use `makeDebounceClick` to guarantee the handler fires within a fixed window even during continuous clicks:

```ts
import { makeDebounceClick } from 'vuse-directive'

// Fires at most every 3000ms even if clicks never stop
app.directive('debounce-click', makeDebounceClick(3000))
```

---

## ⚠️ Important Notes

### Always pass a function, not a function call

Unlike `@click`, custom directives do **not** auto-wrap the binding value in a function. Writing `v-throttle-click="fn(arg)"` causes `fn(arg)` to execute **at render time**, not on click.

```vue
<!-- ❌ Wrong: fn(arg) is called on every render -->
<button v-throttle-click="handleClick(id)">Click</button>

<!-- ✅ Correct: wrap in an arrow function -->
<button v-throttle-click="() => handleClick(id)">Click</button>

<!-- ✅ Also fine: no arguments, pass the reference directly -->
<button v-throttle-click="handleClick">Click</button>
```

This is especially easy to get wrong inside scoped slots where you need to pass slot data as an argument:

```vue
<!-- ❌ Wrong: deleteRow(scope.$index) fires on every row render -->
<template #default="scope">
  <button v-throttle-click="deleteRow(scope.$index)">Delete</button>
</template>

<!-- ✅ Correct -->
<template #default="scope">
  <button v-throttle-click="() => deleteRow(scope.$index)">Delete</button>
</template>
```

> **Why does `@click="fn(arg)"` work then?**  
> Vue's template compiler treats event listeners specially and automatically compiles them into `onClick: ($event) => fn(arg)`. Custom directives receive a plain evaluated expression, so no wrapping happens.

---

## Issues

Found a bug or have a suggestion? Feel free to send an email to:

📮 stafanhulk@gmail.com
