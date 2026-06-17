<script setup>
import { storeToRefs } from "pinia";
import { useSongStore } from "../stores/song";

defineProps({
    isPlaying: Boolean,
    bpm: Number,
});

const emit = defineEmits(["update:bpm", "play", "stop"]);
const song = useSongStore();
const { bpm: currentBpm, sections } = storeToRefs(song);
</script>

<template>
    <div class="transport">
        <div class="tempo-control">
            <label>Tempo: {{ currentBpm }} BPM</label>
            <input
                type="range"
                :value="currentBpm"
                @input="song.setBpm(Number($event.target.value))"
                min="70"
                max="90"
                step="1"
            />
        </div>

        <div class="transport-controls">
            <button @click="song.togglePlayback()" class="play-btn">
                {{ song.isPlaying ? "⏹ Stop" : "▶ Play" }}
            </button>
            <button @click="song.stop()" class="stop-btn">⏸ Reset</button>
        </div>

        <div class="section-selector">
            <label>Section:</label>
            <select v-model="song.currentSection">
                <option value="intro">Intro</option>
                <option value="verse">Couplet</option>
                <option value="chorus">Refrain</option>
                <option value="bridge">Pont</option>
                <option value="outro">Outro</option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.transport {
    background: linear-gradient(135deg, #1b5e20, #2e7d32);
    color: white;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.tempo-control label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.tempo-control input {
    width: 150px;
}

.play-btn {
    background: #4caf50;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    font-weight: bold;
}

.play-btn:hover {
    background: #66bb6a;
}

.stop-btn {
    background: #757575;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
}

.section-selector label {
    margin-right: 10px;
}

.section-selector select {
    padding: 8px 12px;
    border-radius: 4px;
    border: none;
}
</style>
