<template>
  <div id="app-root">
    <SiteHeader />
    <NuxtPage />
    <SiteFooter />
  </div>
</template>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-light);
  color: var(--text-dark);
}
</style>
