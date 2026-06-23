<template>
    <div class="admin-toolbar">
        <div class="admin-toolbar-left">
            <span class="admin-badge">Mode édition</span>
            <select
                class="admin-page-select"
                :value="pageSlug"
                @change="navigateToPage($event.target.value)"
            >
                <option value="accueil">Accueil</option>
                <option value="contact">Contact</option>
                <option value="messages">Messages</option>
                <option value="event-list">Événements</option>
                <option value="agenda">Agenda</option>
                <option v-for="p in customPages" :key="p.slug" :value="p.slug">{{ p.slug }}</option>
            </select>
        </div>
        <div class="admin-toolbar-center">
            <div class="device-toggle" v-if="activeBlock">
                <span class="admin-block-type">{{
                    getBlockLabel(activeBlock.type)
                }}</span>
            </div>
            <div class="device-toggle" v-else>
                <button
                    class="device-btn"
                    :class="{ active: previewDevice === 'desktop' }"
                    @click="previewDevice = 'desktop'"
                    title="Desktop"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="17" />
                    </svg>
                </button>
                <button
                    class="device-btn"
                    :class="{ active: previewDevice === 'tablet' }"
                    @click="previewDevice = 'tablet'"
                    title="Tablet"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="12" y1="18" x2="12" y2="18" />
                    </svg>
                </button>
                <button
                    class="device-btn"
                    :class="{ active: previewDevice === 'mobile' }"
                    @click="previewDevice = 'mobile'"
                    title="Mobile"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <rect x="5" y="2" width="14" height="20" rx="2" />
                        <line x1="12" y1="18" x2="12" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="admin-toolbar-right">
            <div class="undo-redo-group">
                <button
                    class="admin-icon-btn"
                    @click="undo"
                    :disabled="!canUndo()"
                    :title="undoTooltip"
                >
                    ↩
                </button>
                <button
                    class="admin-icon-btn"
                    @click="redo"
                    :disabled="!canRedo()"
                    :title="redoTooltip"
                >
                    ↪
                </button>
            </div>
            <ClientOnly>
                <template v-if="user">
                    <template v-if="checkingAdmin">
                        <span class="admin-save-status">Vérification...</span>
                    </template>
                    <template v-else-if="!isAdminUser" />
                    <template v-else>
                        <span
                            class="admin-save-status unsaved"
                            v-if="hasUnsavedChanges && !saveStatus"
                            >⚠ Modifications non sauvegardées</span
                        >
                        <span
                            class="admin-save-status auto-saved"
                            v-else-if="saveStatus && saveStatus === 'Auto-sauvegardé'"
                            >✓ Auto-sauvegardé</span
                        >
                        <span class="admin-save-status" v-else-if="saveStatus">{{
                            saveStatus
                        }}</span>
                        <img
                            v-if="user.photoURL"
                            :src="user.photoURL"
                            class="admin-avatar"
                            alt="Photo profil"
                        />
                        <span v-else class="admin-user">{{ user.email }}</span>
                        <button
                            class="admin-btn"
                            @click="saveChanges"
                            :disabled="saving"
                        >
                            {{ saving ? "Sauvegarde..." : "Sauvegarder" }}
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary"
                            @click="showVersionHistory = true"
                            title="Historique des versions"
                        >
                            🕐 Versions
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary"
                            @click="showAdminManager = true"
                            title="Gérer les administrateurs"
                        >
                            👥 Admins
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary"
                            @click="signOutAndExit"
                        >
                            Quitter
                        </button>
                    </template>
                </template>
                <template v-else>
                    <button
                        class="admin-btn admin-btn-login"
                        @click="signInWithGoogle"
                    >
                        Se connecter
                    </button>
                    <button
                        class="admin-btn admin-btn-secondary"
                        @click="exitAdmin"
                    >
                        ✕
                    </button>
                </template>
                <template #fallback>
                    <span class="admin-loading">Chargement...</span>
                </template>
            </ClientOnly>
        </div>
    </div>

    <div
        class="admin-sidebar-overlay"
        v-if="sidebarBlock && user"
        @click="closeSidebar"
    ></div>
    <div class="admin-sidebar" v-if="sidebarBlock && user">
        <div class="admin-sidebar-header">
            <h3>{{ getBlockLabel(sidebarBlock.type) }}</h3>
            <button class="admin-close-btn" @click="closeSidebar">
                ✕
            </button>
        </div>
        <div class="admin-sidebar-body">
            <AutoEditor
                :schema="sidebarSchema"
                :model-value="sidebarBlock"
                @update="onAutoUpdate"
            />
            <p v-if="sidebarBlock && BLOCK_TYPES[sidebarBlock.type]?.animations !== 'wrapper'" class="admin-anim-note">
                {{ BLOCK_TYPES[sidebarBlock.type]?.animations === 'none' ? 'Aucune animation configurable pour ce bloc.' : 'Animation CSS native — non modifiable dans l\'éditeur.' }}
            </p>
            <div v-if="!editingFooter && hasImageFields" class="admin-image-section">
                <p class="admin-image-section-label">Images</p>
                <div class="uploader-controls">
                    <input
                        ref="adminFileInput"
                        type="file"
                        accept="image/*"
                        class="file-input"
                        @change="onAdminFileSelected"
                    />
                    <button
                        class="admin-btn"
                        @click.prevent="adminFileInput?.click()"
                    >
                        Téléverser une image
                    </button>
                    <button
                        v-if="uploadedImages.length"
                        class="admin-btn admin-btn-secondary"
                        @click.prevent="toggleAdminImagesList()"
                    >
                        Images uploadées ({{ uploadedImages.length }})
                    </button>
                </div>
                <div v-if="showAdminImagesList" class="admin-uploaded-list">
                    <div v-if="imagesLoading" class="images-loading">
                        Chargement...
                    </div>
                    <div v-else class="admin-uploaded-grid">
                        <div
                            v-for="(u, i) in uploadedImages"
                            :key="i"
                            class="admin-uploaded-item"
                        >
                            <img
                                :src="u"
                                @click="selectAdminUploaded(u)"
                                alt="img"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="admin-sidebar-footer" v-if="!editingFooter">
            <div class="admin-block-actions">
                <button
                    class="admin-action-btn"
                    @click="moveBlock(sidebarBlock.id, -1)"
                    title="Monter"
                >
                    ↑
                </button>
                <button
                    class="admin-action-btn"
                    @click="moveBlock(sidebarBlock.id, 1)"
                    title="Descendre"
                >
                    ↓
                </button>
                <button
                    class="admin-action-btn admin-action-danger"
                    @click="removeBlock(sidebarBlock.id)"
                    title="Supprimer"
                >
                    🗑
                </button>
            </div>
        </div>
        <div class="admin-sidebar-footer" v-else>
            <div class="admin-block-actions">
                <button
                    class="admin-btn"
                    @click="saveFooterChanges"
                    style="flex:1"
                >
                    Sauvegarder le footer
                </button>
            </div>
        </div>
    </div>

    <!-- Version History Modal -->
    <Teleport to="body">
        <div v-if="showVersionHistory" class="version-modal-overlay" @click.self="showVersionHistory = false">
            <div class="version-modal">
                <div class="version-modal-header">
                    <h3>Historique des versions — {{ props.pageSlug }}</h3>
                    <button class="version-modal-close" @click="showVersionHistory = false">✕</button>
                </div>
                <div class="version-modal-body">
                    <div v-if="versionsLoading" class="version-loading">Chargement...</div>
                    <div v-else-if="versions.length === 0" class="version-empty">
                        Aucune version sauvegardée
                    </div>
                    <div v-else class="version-list">
                        <div
                            v-for="v in versions"
                            :key="v.id"
                            class="version-item"
                        >
                            <div class="version-info">
                                <span class="version-date">{{ formatDate(v.savedAt) }}</span>
                                <span class="version-author">{{ v.savedBy }}</span>
                            </div>
                            <button
                                class="admin-btn admin-btn-secondary"
                                @click="restoreVersion(v.id)"
                                :disabled="restoring === v.id"
                            >
                                {{ restoring === v.id ? "Restauration..." : "Restaurer" }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Admin Manager Modal -->
    <Teleport to="body">
        <div v-if="showAdminManager" class="version-modal-overlay" @click.self="showAdminManager = false">
            <div class="version-modal">
                <div class="version-modal-header">
                    <h3>Gestion des administrateurs</h3>
                    <button class="version-modal-close" @click="showAdminManager = false">✕</button>
                </div>
                <div class="version-modal-body">
                    <div class="admin-mgr-section">
                        <h4>Ajouter un admin</h4>
                        <div class="admin-mgr-add">
                            <input
                                v-model="newAdminEmail"
                                placeholder="Email de l'utilisateur"
                                type="email"
                                class="admin-mgr-input"
                            />
                            <button
                                class="admin-btn"
                                @click="addAdmin"
                                :disabled="addingAdmin"
                            >
                                {{ addingAdmin ? "Ajout..." : "Ajouter" }}
                            </button>
                        </div>
                        <p class="admin-mgr-hint">
                            Entrez l'adresse email de l'utilisateur (compte Google utilisé pour la connexion)
                        </p>
                    </div>
                    <div class="admin-mgr-section">
                        <h4>Admins actuels</h4>
                        <div v-if="adminList.length === 0" class="version-empty">
                            Aucun admin
                        </div>
                        <div v-else class="admin-mgr-list">
                            <div
                                v-for="email in adminList"
                                :key="email"
                                class="admin-mgr-item"
                            >
                                <span class="admin-mgr-uid">{{ email }}</span>
                                <button
                                    class="admin-action-btn admin-action-danger"
                                    @click="removeAdmin(email)"
                                    title="Retirer"
                                    :disabled="removingAdmin === email"
                                >
                                    {{ removingAdmin === email ? "..." : "✕" }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="setupMode" class="admin-mgr-section">
                        <p class="admin-mgr-hint">
                            Aucun admin configuré. <button class="admin-btn" @click="setupFirstAdmin">Devenir le premier admin</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from "vue";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { BLOCK_TYPES, ANIMATIONS } from "~/utils/blockTypes.js";
import { useToast } from '~/composables/useToast'

const { showToast } = useToast()

const props = defineProps({
    pageSlug: { type: String, default: "" },
});
const emit = defineEmits(['navigate-preview'])

const router = useRouter();
const route = useRoute();

const {
    isAdminMode,
    activeBlock,
    editingFooter,
    sidebarBlock,
    sidebarSchema,
    selectBlock,
    updateBlock,
    moveBlock,
    removeBlock,
    exitAdmin,
    clearBlocks,
    localBlocks,
    previewDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    nextUndoLabel,
    nextRedoLabel,
    hasUnsavedChanges,
    markSaved,
    selectFooter,
    closeFooterEditor,
    updateFooterBlock,
    saveFooterBlock,
} = useAdmin();

const { $auth } = useNuxtApp();
const user = ref(null);
const saving = ref(false);
const saveStatus = ref("");

// Admin access control
const isAdminUser = ref(false);
const checkingAdmin = ref(true);

let unsubscribe = null;
let autoSaveTimer = null;

// Version history
const showVersionHistory = ref(false);
const versions = ref([]);
const versionsLoading = ref(false);
const restoring = ref(null);

watch(showVersionHistory, (show) => {
    if (show) loadVersions()
})

async function loadVersions() {
    versionsLoading.value = true
    try {
        const res = await fetch(`/api/pages/${props.pageSlug}/versions`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        versions.value = data.versions || []
    } catch (e) {
        console.error('[admin] load versions failed:', e)
        versions.value = []
    } finally {
        versionsLoading.value = false
    }
}

async function restoreVersion(versionId) {
    restoring.value = versionId
    try {
        const res = await fetch(`/api/pages/${props.pageSlug}/versions/${versionId}`, { method: 'PUT' })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (data.blocks) {
            localBlocks.value = data.blocks
        }
        showVersionHistory.value = false
        saveStatus.value = "Version restaurée"
        setTimeout(() => { saveStatus.value = "" }, 3000)
    } catch (e) {
        console.error('[admin] restore failed:', e)
        showToast("Erreur lors de la restauration : " + (e.message || e), 'toast-error')
    } finally {
        restoring.value = null
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "Date inconnue"
    try {
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return dateStr
    }
}

// Admin management
const showAdminManager = ref(false);
const adminList = ref([]);
const newAdminEmail = ref('');
const addingAdmin = ref(false);
const removingAdmin = ref(null);
const setupMode = ref(false);

watch(showAdminManager, (show) => {
    if (show) loadAdminList()
})

async function loadAdminList() {
    const token = await getFirebaseToken()
    if (!token) return
    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            adminList.value = data.emails || []
            setupMode.value = false
        } else if (res.status === 404) {
            setupMode.value = true
            adminList.value = []
        } else {
            adminList.value = []
            setupMode.value = true
        }
    } catch {
        adminList.value = []
        setupMode.value = true
    }
}

async function addAdmin() {
    if (!newAdminEmail.value.trim()) return
    addingAdmin.value = true
    try {
        const token = await getFirebaseToken()
        if (!token) throw new Error('Non authentifié')
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email: newAdminEmail.value.trim() }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const data = await res.json()
        adminList.value = data.emails || []
        newAdminEmail.value = ''
    } catch (e) {
        console.error('[admin] addAdmin failed:', e)
        showToast("Erreur : " + (e.message || e), 'toast-error')
    } finally {
        addingAdmin.value = false
    }
}

async function removeAdmin(email) {
    removingAdmin.value = email
    try {
        const token = await getFirebaseToken()
        if (!token) throw new Error('Non authentifié')
        const res = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const data = await res.json()
        adminList.value = data.emails || []
    } catch (e) {
        console.error('[admin] removeAdmin failed:', e)
        showToast("Erreur : " + (e.message || e), 'toast-error')
    } finally {
        removingAdmin.value = null
    }
}

async function setupFirstAdmin() {
    try {
        const token = await getFirebaseToken()
        if (!token) throw new Error('Non authentifié')
        const res = await fetch('/api/admin/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        showAdminManager.value = false
        // Re-check admin status
        isAdminUser.value = true
        showToast("Vous êtes maintenant administrateur !", 'toast-success')
    } catch (e) {
        console.error('[admin] setupFirstAdmin failed:', e)
        showToast("Erreur : " + (e.message || e), 'toast-error')
    }
}

onMounted(() => {
    unsubscribe = onAuthStateChanged($auth, async (u) => {
        user.value = u;
        if (!u) {
            isAdminUser.value = false;
            checkingAdmin.value = false;
            if (route.path !== '/admin') {
                navigateTo(`/admin?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true })
            }
            return
        }
        // En mode test, on saute la vérification admin
        const config = useRuntimeConfig()
        if (config.public?.TEST_ENV) {
            isAdminUser.value = true
            checkingAdmin.value = false
            return
        }
        // Vérifier si l'utilisateur est admin
        try {
            const token = await u.getIdToken()
            const res = await fetch('/api/admin/check', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            isAdminUser.value = data.isAdmin === true
        } catch {
            isAdminUser.value = false
        }
        checkingAdmin.value = false

        if (!isAdminUser.value) {
            window.location.href = '/admin'
        }
    });

    // Keyboard shortcuts for undo/redo
    const handler = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
            e.preventDefault();
            redo();
        }
    };
    document.addEventListener("keydown", handler);

    loadCustomPages();
});

onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    clearTimeout(autoSaveTimer);
});

const undoTooltip = computed(() => {
    const label = nextUndoLabel();
    return label ? `Annuler : ${label} (Ctrl+Z)` : `Annuler (Ctrl+Z)`;
});

const redoTooltip = computed(() => {
    const label = nextRedoLabel();
    return label ? `Rétablir : ${label} (Ctrl+Shift+Z)` : `Rétablir (Ctrl+Shift+Z)`;
});

// Auto-save Firestore with debounce
watch(
    localBlocks,
    () => {
        if (!user.value || !import.meta.client) return;
        // Show unsaved indicator immediately
        saveStatus.value = "";
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            autoSave();
        }, 3000);
    },
    { deep: true },
);

async function getFirebaseToken() {
    try {
        return await user.value?.getIdToken()
    } catch {
        return null
    }
}

async function saveToServer() {
    const token = await getFirebaseToken()
    if (!token) throw new Error('Non authentifié')
    try {
        const res = await fetch(`/api/pages/${props.pageSlug}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ blocks: localBlocks.value }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        return true
    } catch (e) {
        console.error('[admin] save failed:', e)
        throw e
    }
}

async function autoSave() {
    if (!user.value) return;
    try {
        await saveToServer()
        markSaved();
        saveStatus.value = "Auto-sauvegardé";
        setTimeout(() => {
            saveStatus.value = "";
        }, 2000);
    } catch (e) {
        saveStatus.value = "Erreur auto-save";
        setTimeout(() => {
            saveStatus.value = "";
        }, 3000);
    }
}

function getBlockLabel(type) {
    if (!type) return "";
    return BLOCK_TYPES[type]?.label || type;
}

function getBlockSchema(type) {
    if (!type) return [];
    return BLOCK_TYPES[type]?.schema || [];
}

const hasImageFields = computed(() => {
    if (!sidebarBlock.value) return false;
    const schema = sidebarSchema.value;
    return schema.some((f) => f.type === "image" || f.type === "images");
});

// Image upload state
const adminFileInput = ref(null);
const uploadedImages = ref([]);
const showAdminImagesList = ref(false);
const imagesLoading = ref(false);

function onAutoUpdate(block) {
    if (editingFooter.value) {
        updateFooterBlock(block.props);
    } else {
        updateBlock(block.id, block.props);
    }
}

async function onAdminFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !import.meta.client) return;
    imagesLoading.value = true;
    try {
        const {
            getStorage,
            ref: storageRef,
            uploadBytes,
            getDownloadURL,
        } = await import("firebase/storage");
        const storage = getStorage();
        const path = `uploads/${Date.now()}_${file.name}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, file);
        const url = await getDownloadURL(r);
        if (sidebarBlock.value) {
            if (editingFooter.value) {
                updateFooterBlock({ [fieldKeysWithImages.value[0]]: url });
            } else {
                updateBlock(sidebarBlock.value.id, {
                    [fieldKeysWithImages.value[0]]: url,
                });
            }
        }
        await loadAdminUploadedImages();
    } catch (err) {
        console.error("Upload error", err);
        showToast("Erreur lors du téléversement : " + (err.message || err), 'toast-error');
    } finally {
        imagesLoading.value = false;
    }
}

const fieldKeysWithImages = computed(() => {
    if (!sidebarBlock.value) return [];
    const schema = sidebarSchema.value;
    return schema.filter((f) => f.type === "image").map((f) => f.key);
});

async function loadAdminUploadedImages() {
    if (!import.meta.client) return;
    imagesLoading.value = true;
    try {
        const {
            getStorage,
            ref: storageRef,
            listAll,
            getDownloadURL,
        } = await import("firebase/storage");
        const storage = getStorage();
        const listRef = storageRef(storage, "uploads");
        const res = await listAll(listRef);
        const urls = await Promise.all(res.items.map((i) => getDownloadURL(i)));
        uploadedImages.value = urls;
    } catch (err) {
        console.error("Error loading images", err);
        uploadedImages.value = [];
    } finally {
        imagesLoading.value = false;
    }
}

function toggleAdminImagesList() {
    showAdminImagesList.value = !showAdminImagesList.value;
    if (showAdminImagesList.value) loadAdminUploadedImages();
}

function selectAdminUploaded(url) {
    if (sidebarBlock.value && fieldKeysWithImages.value.length > 0) {
        if (editingFooter.value) {
            updateFooterBlock({ [fieldKeysWithImages.value[0]]: url });
        } else {
            updateBlock(sidebarBlock.value.id, {
                [fieldKeysWithImages.value[0]]: url,
            });
        }
    }
    showAdminImagesList.value = false;
}

function closeSidebar() {
    if (editingFooter.value) {
        closeFooterEditor();
    } else {
        selectBlock(null);
    }
}

async function saveFooterChanges() {
    try {
        await saveFooterBlock();
        markSaved();
        showToast("Footer sauvegardé !", 'toast-success');
    } catch (e) {
        showToast("Erreur lors de la sauvegarde du footer : " + e.message, 'toast-error');
    }
}

const customPages = ref([]);

function loadCustomPages() {
    fetch('/api/pages')
        .then(res => res.json())
        .then(data => {
            const hardcoded = ['accueil', 'contact', 'messages', 'event-list', 'agenda']
            customPages.value = (data.pages || []).filter(p => !hardcoded.includes(p.slug))
        })
        .catch(() => { customPages.value = [] })
}

async function navigateToPage(slug) {
    if (previewDevice.value !== "desktop") {
        emit('navigate-preview', slug)
        return
    }
    // Desktop mode: client-side navigation
    clearBlocks();
    const newQuery = { ...route.query, admin: "true", device: previewDevice.value };
    try {
        if (isAdminMode) isAdminMode.value = true;
        const root =
            document.getElementById("app-root") ||
            document.getElementById("__nuxt");
        if (root && !root.classList.contains("admin-mode"))
            root.classList.add("admin-mode");
    } catch (e) {
        console.warn("navigateToPage: could not set admin-mode class", e);
    }
    try {
        await router.push({ path: slug === "accueil" ? "/" : `/${slug}`, query: newQuery });
        try { window.scrollTo(0, 0) } catch (e) { console.warn(e) }
    } catch (err) {
        console.error("navigateToPage: router.push failed", err);
    }
}

async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup($auth, provider);
    } catch (e) {
        console.error("Login error:", e);
        showToast("Connexion échouée : " + e.message, 'toast-error');
    }
}

async function signOutAndExit() {
    try {
        await signOut($auth);
    } catch (e) {
        console.error("Sign out error:", e);
    }
    exitAdmin();
}

async function saveChanges() {
    if (!user.value) {
        showToast("Connectez-vous pour sauvegarder.", 'toast-error');
        return;
    }
    saving.value = true;
    try {
        await saveToServer();
        // Also persist menu changes
        const { saveMenuToFirestore } = useMenuEditor();
        await saveMenuToFirestore();
        markSaved();
        saveStatus.value = "Sauvegardé";
        setTimeout(() => {
            saveStatus.value = "";
        }, 2000);
    } catch (e) {
        console.error("Save error:", e);
        showToast("Erreur lors de la sauvegarde : " + (e.message || e), 'toast-error');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.admin-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: #1a1a2e;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 12px;
    z-index: 10000;
    gap: 12px;
}
.admin-toolbar-left,
.admin-toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.admin-toolbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
}
.admin-badge {
    background: #ef4b54;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: 700;
    white-space: nowrap;
}
.admin-page-select {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.85em;
    cursor: pointer;
    outline: none;
}
.admin-page-select option {
    background: #1a1a2e;
    color: white;
}
.admin-page-select:hover {
    background: rgba(255, 255, 255, 0.2);
}
.admin-block-type {
    font-size: 0.9em;
    font-weight: 600;
}
.device-toggle {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 3px;
}
.device-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}
.device-btn:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
}
.device-btn.active {
    color: white;
    background: rgba(255, 255, 255, 0.2);
}
.admin-user {
    font-size: 0.8em;
    opacity: 0.8;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.undo-redo-group {
    display: flex;
    gap: 2px;
    margin-right: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 2px;
}
.admin-icon-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: all 0.15s;
}
.admin-icon-btn:hover {
    color: white;
    background: rgba(255, 255, 255, 0.2);
}
.admin-icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}
.admin-save-status {
    font-size: 0.75em;
    color: rgba(255, 255, 255, 0.6);
    margin-right: 8px;
    white-space: nowrap;
}
.admin-save-status.unsaved {
    color: #fbbf24;
}
.admin-save-status.auto-saved {
    color: #4ade80;
}
.admin-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
}
.admin-btn {
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    font-size: 0.85em;
    font-weight: 600;
    cursor: pointer;
    background: #3b82f6;
    color: white;
    white-space: nowrap;
}
.admin-btn:hover {
    background: #2563eb;
}
.admin-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.admin-btn-secondary {
    background: rgba(255, 255, 255, 0.2);
}
.admin-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
}
.admin-btn-login {
    background: #fff;
    color: #1a1a2e;
}
.admin-btn-login:hover {
    background: #f0f0f0;
}

.admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 9998;
    top: 48px;
}
.admin-sidebar {
    position: fixed;
    top: 48px;
    right: 0;
    bottom: 0;
    width: 320px;
    background: white;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    display: flex;
    flex-direction: column;
}
.admin-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #eee;
}
.admin-sidebar-header h3 {
    margin: 0;
    font-size: 1em;
    color: #1a1a2e;
}
.admin-close-btn {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    color: #888;
    padding: 4px 8px;
}
.admin-close-btn:hover {
    color: #333;
}
.admin-sidebar-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}
.admin-field {
    margin-bottom: 16px;
}
.admin-field label {
    display: block;
    font-size: 0.8em;
    font-weight: 600;
    color: #555;
    margin-bottom: 4px;
}
.admin-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9em;
    font-family: inherit;
}
.admin-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.admin-textarea {
    resize: vertical;
    min-height: 80px;
}
.admin-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}
.admin-checkbox input {
    width: 18px;
    height: 18px;
    accent-color: #3b82f6;
}
.admin-unsupported {
    font-size: 0.8em;
    color: #888;
    font-style: italic;
}
.admin-image-section {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #eee;
}
.admin-image-section-label {
    font-size: 0.72em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7c7c9a;
    margin-bottom: 8px;
}
.admin-anim-note {
    font-size: 0.78em;
    color: #888;
    background: #f5f5f5;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 8px 0;
}
.admin-sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
}
.admin-block-actions {
    display: flex;
    gap: 8px;
}
.admin-action-btn {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 1em;
}
.admin-action-btn:hover {
    background: #f5f5f5;
}
.admin-action-danger:hover {
    background: #fee;
    border-color: #ef4b54;
}
.admin-loading {
    font-size: 0.8em;
    opacity: 0.6;
}
.admin-image-preview {
    width: 100%;
    max-height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-top: 8px;
}
.uploader-controls {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    align-items: center;
}
.file-input {
    display: none;
}
.admin-uploaded-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 8px;
}
.admin-uploaded-item img {
    width: 100%;
    height: 56px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid #2d2d3f;
}
.images-loading {
    color: #666;
    font-size: 0.9em;
    margin-top: 8px;
}
</style>

<style>
/* Version history modal */
.version-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
}
.version-modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.2);
}
.version-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
}
.version-modal-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}
.version-modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 4px 8px;
}
.version-modal-close:hover {
    color: #333;
}
.version-modal-body {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
}
.version-loading, .version-empty {
    color: #888;
    text-align: center;
    padding: 24px;
}
.version-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.version-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #f8f9fa;
    border-radius: 8px;
}
.version-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.version-date {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}
.version-author {
    font-size: 12px;
    color: #888;
}

/* Admin manager */
.admin-mgr-section {
    margin-bottom: 16px;
}
.admin-mgr-section h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #555;
}
.admin-mgr-add {
    display: flex;
    gap: 8px;
}
.admin-mgr-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    font-family: monospace;
}
.admin-mgr-hint {
    font-size: 12px;
    color: #999;
    margin: 6px 0 0;
}
.admin-mgr-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.admin-mgr-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #f8f9fa;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
}
.admin-mgr-uid {
    word-break: break-all;
    color: #555;
}
.admin-mgr-item button {
    flex: 0 0 22px;
    padding: 2px;
    font-size: 11px;
    border-radius: 3px;
    line-height: 1;
}

/* Global fallback: ensure site header is offset below admin toolbar when in admin mode */
#app-root.admin-mode .site-header {
    top: var(--admin-offset, 48px) !important;
}
/* Spacer = header height only (72px desktop, 52px mobile).
   Admin toolbar (48px) is already above in normal flow — do NOT add --admin-offset. */
#app-root.admin-mode .header-spacer {
    height: 72px;
}
@media (max-width: 768px) {
    #app-root.admin-mode .header-spacer {
        height: 52px;
    }
}
</style>
