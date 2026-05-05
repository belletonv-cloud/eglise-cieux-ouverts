<template>
  <div id="app-root">
    <div class="content-wrapper">
      <SiteHeader />
      <main class="main-content">
        <slot />
      </main>
    </div>
    <div class="footer-wrapper">
      <SiteFooter />
    </div>
  </div>
</template>

<style>
#app-root {
  min-height: 100vh;
  background: white;
  color: var(--text-dark);
}

.content-wrapper {
  position: relative;
  z-index: 2;
  background: white;
  /* Add shadow at bottom to separate from footer */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.footer-wrapper {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

.main-content {
  flex: 1;
}
</style>
