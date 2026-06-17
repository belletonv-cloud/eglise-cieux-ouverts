<script setup>
import { ref, onMounted } from "vue";
import Transport from "./components/Transport.vue";
import ChordEditor from "./components/ChordEditor.vue";
import DrumMachine from "./components/DrumMachine.vue";
import BassEditor from "./components/BassEditor.vue";
import Mixer from "./components/Mixer.vue";
import VocalSynth from "./components/VocalSynth.vue";

// État global
const isPlaying = ref(false);
const bpm = ref(78);
const currentSection = ref("intro"); // intro, verse, chorus, bridge, outro

onMounted(() => {
    // Initialiser Tone.js sur interaction utilisateur
});
</script>

<template>
    <div class="app">
        <header>
            <h1>🎵 Reggae Songmaker</h1>
            <p class="subtitle">Style Les Guetteurs / Melchior</p>
        </header>

        <main>
            <Transport :is-playing="isPlaying" :bpm="bpm" />

            <section class="editors">
                <ChordEditor />
                <DrumMachine />
                <BassEditor />
                <VocalSynth />
                <Mixer />
            </section>
        </main>
    </div>
</template>

<style scoped>
.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family:
        "Nunito",
        -apple-system,
        sans-serif;
}

header {
    text-align: center;
    margin-bottom: 30px;
}

h1 {
    font-family: "Playfair Display", serif;
    color: #2e7d32;
}

.subtitle {
    color: #666;
    font-style: italic;
}

.editors {
    display: grid;
    gap: 20px;
}
</style>
