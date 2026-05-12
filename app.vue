<template>
  <NuxtLayout>
    <NuxtPage />
    <GlobalToast />
  </NuxtLayout>
</template>

<style>
/* Extrême sécurité : empêche toute bordure ou outline à l’hover/selected sur tous les blocs */
.block-wrapper:hover, .block-wrapper.selected {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}
</style>

