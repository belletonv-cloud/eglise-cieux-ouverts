<template>
  <div id="app-root">
    <SiteHeader />
    <slot />
    <SiteFooter />
  </div>
</template>

<script setup>
useHead({
  noscript: [
    { innerHTML: '<style>.hero-bienvenue-line,.hero-subtitle,.hero-socials,.vision-label,.vision-quote,.btn-white,.contact-title,.contact-phone,.contact-socials,.contact-right,.rejoins-text-container,.rejoins-horaire,.shutter-char,.aspirations-list li,.aspirations-title,.block-anim-fadeIn,.block-anim-slideUp,.block-anim-slideLeft,.block-anim-zoom,.block-anim-portal,.block-anim-bounce,.block-anim-flip,.block-anim-wave,.block-gallery,.block-wrapper{opacity:1!important;transform:none!important}.shutter-char::before{display:none!important}.shutter-char{overflow:visible!important}@supports not (animation-timeline:--cascade){.contact-title,.contact-phone,.contact-socials,.contact-right,.cta-link,.aspirations-list li,.aspirations-title,.circle-left,.circle-right,.circle-small{animation:none!important}}.circle,.aspirations-list li,.aspirations-title{animation:none!important}.circle{display:block!important;opacity:.5!important;transform:translate(-50%,-50%)!important}.gallery-img{max-width:100%!important;height:auto!important;display:block!important}.aspirations-viewport{height:auto!important}.sticky-box{position:relative!important;min-height:auto!important;top:auto!important}.nav-desktop{display:flex!important;flex-wrap:wrap;gap:4px}.burger{display:none!important}</style><p style="margin-top:80px;text-align:center;padding:20px;background:#064886;color:white;font-family:sans-serif;font-size:16px;">Ce site fonctionne mieux avec JavaScript activé. Certains contenus peuvent ne pas s\'afficher correctement.</p>' }
  ]
})
</script>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: var(--text-dark);
}
</style>
