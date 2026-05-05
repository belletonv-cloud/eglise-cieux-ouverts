<template>
  <section class="block-nous-rejoindre" :style="{ background: props.backgroundGradient }">
    <div class="nous-rejoindre-inner">
      <h2 class="nous-rejoindre-title">{{ props.title }}</h2>
      <div class="circle-btn-wrap">
        <NuxtLink :to="props.link" class="circle-btn">
          <span class="circle-inner"></span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const p = defineProps({
  props: { type: Object, required: true },
  visibility: { type: Object, default: () => ({}) },
})
</script>

<style scoped>
.block-nous-rejoindre {
  padding: 100px 24px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.nous-rejoindre-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.nous-rejoindre-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 700;
  font-size: clamp(3em, 6vw, 5em);
  margin: 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.circle-btn-wrap {
  position: relative;
  display: inline-block;
}

.circle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.circle-btn:hover {
  transform: scale(1.05);
}

.circle-inner {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.circle-btn:hover .circle-inner {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .circle-btn {
    width: 150px;
    height: 150px;
  }
  .circle-inner {
    width: 90px;
    height: 90px;
  }
}
</style>