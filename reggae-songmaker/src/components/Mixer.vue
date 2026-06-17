<script setup>
import { useSongStore } from "../stores/song";

const song = useSongStore();
</script>

<template>
    <div class="mixer">
        <h2>🎚️ Mixeur</h2>

        <div class="volume-controls">
            <div class="track-control">
                <label
                    >Drums : {{ Math.round(song.volumes.drums * 100) }}%</label
                >
                <input
                    type="range"
                    v-model="song.volumes.drums"
                    min="0"
                    max="1"
                    step="0.05"
                />
            </div>

            <div class="track-control">
                <label>Bass : {{ Math.round(song.volumes.bass * 100) }}%</label>
                <input
                    type="range"
                    v-model="song.volumes.bass"
                    min="0"
                    max="1"
                    step="0.05"
                />
            </div>

            <div class="track-control">
                <label
                    >Chords :
                    {{ Math.round(song.volumes.chords * 100) }}%</label
                >
                <input
                    type="range"
                    v-model="song.volumes.chords"
                    min="0"
                    max="1"
                    step="0.05"
                />
            </div>

            <div class="effects">
                <h3>Effets</h3>
                <button class="effect-btn">Delay</button>
                <button class="effect-btn">Reverb</button>
                <button class="effect-btn">Filter</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mixer {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.track-control {
    margin: 15px 0;
}

.track-control label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.volume-controls input[type="range"] {
    width: 100%;
}

.effect-btn {
    background: #ff9800;
    color: white;
    border: none;
    padding: 8px 16px;
    margin: 3px;
    border-radius: 4px;
    cursor: pointer;
}
</style>
