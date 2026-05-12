<template>
  <div id="app-root">
    <SiteHeader />
    <slot />
    <SiteFooter />
  </div>
</template>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--text-dark);
}
</style>
