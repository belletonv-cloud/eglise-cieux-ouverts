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
                <option v-for="p in customPages" :key="p.slug" :value="p.slug">{{ p.title || p.slug }}</option>
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
                    @click="setDevice('desktop')"
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
                    @click="setDevice('tablet')"
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
                    @click="setDevice('mobile')"
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
                            class="admin-btn admin-btn-add-block"
                            @click="showBlockPicker = true"
                            title="Ajouter un bloc à la page"
                        >
                            ＋ Bloc
                        </button>
                        <button
                            class="admin-btn"
                            @click="saveChanges"
                            :disabled="saving"
                            title="Sauvegarder les modifications"
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
                            class="admin-btn admin-btn-secondary admin-btn-compact"
                            @click="showComments = true"
                            title="Demandes développeur"
                        >
                            <span class="icon">💬</span><span class="label">Demandes</span><span v-if="unresolvedCommentCount" class="admin-comment-count">{{ unresolvedCommentCount }}</span>
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary admin-btn-compact"
                            @click="openContactMessages"
                            title="Messages de contact"
                        >
                            <span class="icon">📬</span><span class="label">Messages</span><span v-if="unreadContactCount" class="admin-msg-count">{{ unreadContactCount }}</span>
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary admin-btn-compact"
                            @click="showSettings = true"
                            title="Configuration"
                        >
                            <span class="icon">⚙️</span><span class="label">Config</span>
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary admin-btn-compact"
                            @click="showEventManager = true"
                            title="Gérer les événements"
                        >
                            <span class="icon">📅</span><span class="label">Événements</span>
                        </button>
                        <button
                            class="admin-btn admin-btn-secondary"
                            @click="signOutAndExit"
                            title="Quitter le mode admin"
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
            <div v-if="!editingFooter" class="admin-responsive-panel">
                <p class="admin-responsive-label">Visible sur {{ deviceLabel(previewDevice) }}</p>
                <button
                    class="admin-vis-btn"
                    :class="{ off: deviceVisible(previewDevice) === false }"
                    :title="deviceVisible(previewDevice) === false ? `Masqué sur ${deviceLabel(previewDevice)}` : `Visible sur ${deviceLabel(previewDevice)}`"
                    @click="toggleDeviceVisibility(previewDevice)"
                >
                    <span class="admin-vis-icon">{{ deviceIcon(previewDevice) }}</span>
                    <span class="admin-vis-name">{{ deviceLabel(previewDevice) }}</span>
                    <span class="admin-vis-state">{{ deviceVisible(previewDevice) === false ? '🚫 Masqué' : '✓ Visible' }}</span>
                </button>
                <!-- Rappel passif (non cliquable) : évite de devoir changer de
                     device juste pour vérifier si le bloc est masqué ailleurs.
                     Seul le bouton ci-dessus (device actif) modifie l'état. -->
                <div class="admin-vis-others">
                    <span
                        v-for="d in otherDevices"
                        :key="d"
                        class="admin-vis-mini"
                        :class="{ off: deviceVisible(d) === false }"
                        :title="deviceVisible(d) === false ? `Masqué sur ${deviceLabel(d)}` : `Visible sur ${deviceLabel(d)}`"
                    >
                        {{ deviceIcon(d) }} {{ deviceVisible(d) === false ? '🚫' : '✓' }}
                    </span>
                </div>
                <div v-if="previewDevice !== 'desktop'" class="admin-responsive-editing">
                    ✎ Vous modifiez la version <strong>{{ deviceLabel(previewDevice) }}</strong>.
                    Les réglages s'appliquent à ce format uniquement.
                    <button
                        v-if="hasDeviceOverrides"
                        class="admin-reset-overrides"
                        @click="resetCurrentDeviceOverrides"
                    >
                        Réinitialiser ({{ deviceLabel(previewDevice) }})
                    </button>
                </div>
                <p v-else class="admin-responsive-hint">
                    Choisis Tablette/Mobile dans la barre du haut pour régler chaque format.
                </p>
            </div>
            <div v-if="sidebarBlock" class="admin-comment-panel">
                <p class="admin-comment-label">💬 Note pour le développeur</p>
                <textarea
                    v-model="commentDraft"
                    class="admin-comment-textarea"
                    placeholder="Ex : « J'aimerais un compteur ici — ça demande du code »"
                    rows="3"
                ></textarea>
                <div class="admin-comment-actions">
                    <button
                        class="admin-btn admin-btn-secondary"
                        @click="saveComment"
                        :disabled="!commentDraft.trim() || savingComment"
                    >
                        {{ savingComment ? "..." : (activeComment ? "Mettre à jour" : "Créer la demande") }}
                    </button>
                    <button
                        v-if="activeComment && !activeComment.resolved"
                        class="admin-btn admin-btn-secondary"
                        @click="toggleCommentResolved(true)"
                    >✓ Marquer résolu</button>
                    <button
                        v-if="activeComment && activeComment.resolved"
                        class="admin-btn admin-btn-secondary"
                        @click="toggleCommentResolved(false)"
                    >↺ Rouvrir</button>
                    <button
                        v-if="activeComment"
                        class="admin-comment-del-btn"
                        @click="deleteActiveComment"
                        title="Supprimer"
                    >✕</button>
                </div>
                <p v-if="activeComment?.resolved" class="admin-comment-resolved-note">
                    Résolu{{ activeComment.resolvedBy ? ' par ' + activeComment.resolvedBy : '' }}
                </p>
            </div>
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

    <!-- Block Picker Modal -->
    <Teleport to="body">
        <div v-if="showBlockPicker" class="version-modal-overlay" @click.self="showBlockPicker = false">
            <div class="version-modal block-picker-modal">
                <div class="version-modal-header">
                    <div>
                        <h3>Ajouter un bloc</h3>
                        <p v-if="activeBlock" class="block-picker-subtitle">Sera inséré après « {{ getBlockLabel(activeBlock.type) }} »</p>
                        <p v-else class="block-picker-subtitle">Sera ajouté en fin de page</p>
                    </div>
                    <button class="version-modal-close" @click="showBlockPicker = false" title="Fermer">✕</button>
                </div>
                <div class="version-modal-body">
                    <div class="block-picker-grid">
                        <button
                            v-for="bt in pickableBlockTypes"
                            :key="bt.key"
                            class="block-picker-card"
                            @click="pickBlock(bt.key)"
                        >
                            <span class="block-picker-icon">{{ bt.icon }}</span>
                            <span class="block-picker-label">{{ bt.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Template Picker Modal (2nd step, only for block types with templates) -->
    <Teleport to="body">
        <div v-if="showTemplatePicker" class="version-modal-overlay" @click.self="showTemplatePicker = false">
            <div class="version-modal block-picker-modal">
                <div class="version-modal-header">
                    <div>
                        <h3>Choisir un modèle</h3>
                        <p class="block-picker-subtitle">{{ getBlockLabel(pendingBlockType) }}</p>
                    </div>
                    <button class="version-modal-close" @click="showTemplatePicker = false" title="Fermer">✕</button>
                </div>
                <div class="version-modal-body">
                    <button class="block-picker-back" @click="backToBlockPicker">← Retour</button>
                    <div class="block-picker-grid">
                        <button
                            v-for="tpl in BLOCK_TYPES[pendingBlockType]?.templates || []"
                            :key="tpl.id"
                            class="block-picker-card"
                            @click="pickTemplate(tpl)"
                        >
                            <span class="block-picker-icon">{{ tpl.icon || '📄' }}</span>
                            <span class="block-picker-label">{{ tpl.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Version History Modal -->
    <Teleport to="body">
        <div v-if="showVersionHistory" class="version-modal-overlay" @click.self="showVersionHistory = false">
            <div class="version-modal">
                <div class="version-modal-header">
                    <h3>Historique des versions — {{ props.pageSlug }} <span v-if="versions.length" class="version-count">{{ versions.length }}</span></h3>
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
                            <div class="version-item-row">
                                <div
                                    class="version-info"
                                    :style="{ cursor: v.changes ? 'pointer' : 'default' }"
                                    :title="v.changes ? (expandedVersion === v.id ? 'Masquer les détails' : 'Voir les détails des changements') : undefined"
                                    @click="v.changes && toggleVersionExpand(v.id)"
                                >
                                    <span class="version-date">{{ formatDate(v.savedAt) }}</span>
                                    <span class="version-author">{{ v.savedBy }}</span>
                                    <div class="version-meta">
                                        <span class="version-blocks">{{ v.blockCount }} bloc{{ v.blockCount !== 1 ? 's' : '' }}</span>
                                        <span v-if="v === versions[0]" class="version-current">Actuelle</span>
                                        <span v-if="v.changes" class="version-expand-arrow">{{ expandedVersion === v.id ? '▲' : '▼' }}</span>
                                    </div>
                                    <div v-if="v.changes && (v.changes.added || v.changes.removed || v.changes.modified)" class="version-diff">
                                        <span v-if="v.changes.added" class="vd-added">+{{ v.changes.added }} ajouté{{ v.changes.added > 1 ? 's' : '' }}</span>
                                        <span v-if="v.changes.removed" class="vd-removed">−{{ v.changes.removed }} supprimé{{ v.changes.removed > 1 ? 's' : '' }}</span>
                                        <span v-if="v.changes.modified" class="vd-modified">~{{ v.changes.modified }} modifié{{ v.changes.modified > 1 ? 's' : '' }}</span>
                                    </div>
                                </div>
                                <div class="version-actions">
                                    <button
                                        class="admin-btn admin-btn-secondary version-restore-btn"
                                        @click.stop="restoreVersion(v.id)"
                                        :disabled="restoring === v.id || deletingVersion === v.id"
                                        title="Restaurer cette version"
                                    >
                                        {{ restoring === v.id ? "..." : "Restaurer" }}
                                    </button>
                                    <button
                                        class="version-del-btn"
                                        @click.stop="deleteVersion(v.id)"
                                        :disabled="deletingVersion === v.id || restoring === v.id"
                                        title="Supprimer cette version"
                                    >{{ deletingVersion === v.id ? "…" : "✕" }}</button>
                                </div>
                            </div>
                            <div v-if="expandedVersion === v.id && v.changes" class="version-detail-panel">
                                <div v-if="v.changes.details?.modified?.length" class="vd-detail-group">
                                    <span class="vd-detail-label">~ Modifiés</span>
                                    <span v-for="label in v.changes.details.modified" :key="label" class="vd-detail-item vd-modified">{{ label }}</span>
                                </div>
                                <div v-if="v.changes.details?.added?.length" class="vd-detail-group">
                                    <span class="vd-detail-label">+ Ajoutés</span>
                                    <span v-for="label in v.changes.details.added" :key="label" class="vd-detail-item vd-added">{{ label }}</span>
                                </div>
                                <div v-if="v.changes.details?.removed?.length" class="vd-detail-group">
                                    <span class="vd-detail-label">− Supprimés</span>
                                    <span v-for="label in v.changes.details.removed" :key="label" class="vd-detail-item vd-removed">{{ label }}</span>
                                </div>
                                <p v-if="!v.changes.details?.modified?.length && !v.changes.details?.added?.length && !v.changes.details?.removed?.length" class="vd-no-detail">Aucun changement détecté</p>
                            </div>
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
                                    class="admin-mgr-del-btn"
                                    @click="removeAdmin(email)"
                                    title="Retirer"
                                    :disabled="removingAdmin === email"
                                >{{ removingAdmin === email ? "…" : "✕" }}</button>
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

    <!-- Contact Messages Modal -->
    <Teleport to="body">
        <div v-if="showContactMessages" class="version-modal-overlay" @click.self="showContactMessages = false">
            <div class="version-modal">
                <div class="version-modal-header">
                    <h3>Messages de contact <span v-if="contactMessages.length" class="version-count">{{ contactMessages.length }}</span></h3>
                    <button class="version-modal-close" @click="showContactMessages = false">✕</button>
                </div>
                <div class="version-modal-body">
                    <div v-if="!contactMessagesLoading && contactMessages.length > 0" class="contact-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total</span>
                            <span class="stat-value">{{ contactMessages.length }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Non lus</span>
                            <span class="stat-value">{{ unreadContactCount }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Archivés</span>
                            <span class="stat-value">{{ archivedContactCount }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Newsletter</span>
                            <span class="stat-value">{{ newsletterSubscriberCount }}</span>
                        </div>
                    </div>
                    <div v-if="!contactMessagesLoading && contactMessages.length > 0" class="contact-filters">
                        <button
                            class="filter-btn"
                            :class="{ active: contactMessageFilter === 'all' }"
                            @click="contactMessageFilter = 'all'"
                        >Tous ({{ contactMessages.length }})</button>
                        <button
                            class="filter-btn"
                            :class="{ active: contactMessageFilter === 'unread' }"
                            @click="contactMessageFilter = 'unread'"
                        >Non lus ({{ unreadContactCount }})</button>
                        <button
                            class="filter-btn"
                            :class="{ active: contactMessageFilter === 'archived' }"
                            @click="contactMessageFilter = 'archived'"
                        >Archivés ({{ archivedContactCount }})</button>
                    </div>
                    <div v-if="!contactMessagesLoading && contactMessages.length > 0" class="contact-sort">
                        <label>Tri:</label>
                        <select v-model="contactMessageSort" class="sort-select">
                            <option value="date-desc">Plus récent d'abord</option>
                            <option value="date-asc">Plus ancien d'abord</option>
                            <option value="sender">Par sender (A-Z)</option>
                        </select>
                    </div>
                    <div v-if="contactMessagesLoading" class="version-loading">Chargement...</div>
                    <div v-else-if="contactMessages.length === 0" class="version-empty">Aucun message reçu</div>
                    <div v-else-if="filteredContactMessages.length === 0" class="version-empty">Aucun message correspondant au filtre</div>
                    <div v-else class="version-list">
                        <div
                            v-for="m in filteredContactMessages"
                            :key="m.id"
                            class="version-item"
                            :class="{ 'comment-resolved': m.status === 'read', 'is-archived': m.status === 'archived' }"
                        >
                            <div class="version-item-row">
                                <div class="version-info">
                                    <span class="version-date">{{ new Date(m.createdAt).toLocaleString('fr-FR') }}</span>
                                    <span class="version-author">{{ m.prenom }} {{ m.nom }} — <a :href="`mailto:${m.email}`">{{ m.email }}</a>{{ m.ville ? ' — ' + m.ville : '' }}{{ m.newsletter ? ' — 📧 Newsletter' : '' }}</span>
                                    <div class="version-meta">{{ m.message }}</div>
                                </div>
                                <div class="version-actions">
                                    <button class="admin-btn admin-btn-secondary" @click.stop="toggleContactRead(m)">
                                        {{ m.status === 'read' ? "↺ Non lu" : "✓ Lu" }}
                                    </button>
                                    <button class="admin-btn admin-btn-secondary" @click.stop="toggleContactArchived(m)">
                                        {{ m.status === 'archived' ? "↺ Restaurer" : "📦 Archiver" }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Comments (Developer Requests) Modal -->
    <Teleport to="body">
        <div v-if="showComments" class="version-modal-overlay" @click.self="showComments = false">
            <div class="version-modal">
                <div class="version-modal-header">
                    <h3>Demandes développeur <span v-if="allComments.length" class="version-count">{{ allComments.length }}</span></h3>
                    <button class="version-modal-close" @click="showComments = false">✕</button>
                </div>
                <div class="version-modal-body">
                    <div v-if="commentsLoading" class="version-loading">Chargement...</div>
                    <div v-else-if="allComments.length === 0" class="version-empty">Aucune demande</div>
                    <div v-else class="version-list">
                        <div
                            v-for="c in sortedComments"
                            :key="c.id"
                            class="version-item"
                            :class="{ 'comment-resolved': c.resolved }"
                        >
                            <div class="version-item-row">
                                <div class="version-info" style="cursor:pointer" @click="goToComment(c)">
                                    <span class="version-date">{{ new Date(c.createdAt).toLocaleString('fr-FR') }}</span>
                                    <span class="version-author">{{ c.pageSlug }} — {{ c.blockLabel || c.blockType }}</span>
                                    <div class="version-meta">{{ c.message }}</div>
                                </div>
                                <div class="version-actions">
                                    <button class="admin-btn admin-btn-secondary" @click.stop="toggleGlobalCommentResolved(c)">
                                        {{ c.resolved ? "↺ Rouvrir" : "✓ Résolu" }}
                                    </button>
                                    <button class="version-del-btn" @click.stop="deleteGlobalComment(c.id)" title="Supprimer">✕</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Modale Configuration -->
    <Teleport to="body" v-if="showSettings">
        <div class="settings-modal-overlay" @click.self="showSettings = false">
            <div class="settings-modal">
                <div class="settings-modal-header">
                    <h2>Configuration</h2>
                    <button class="close-btn" @click="showSettings = false">✕</button>
                </div>
                <div class="settings-modal-body">
                    <div class="settings-field">
                        <label>Email de destination (formulaire contact)</label>
                        <input
                            v-model="settingsForm.contactEmail"
                            type="email"
                            placeholder="contact@example.com"
                            class="settings-input"
                        />
                        <p class="settings-hint">Les messages du formulaire de contact seront envoyés à cet email</p>
                    </div>
                    <div class="settings-field">
                        <label class="settings-checkbox-label">
                            <input
                                v-model="settingsForm.showEventsPage"
                                type="checkbox"
                                class="settings-checkbox"
                            />
                            Afficher la page Événements même sans billetterie
                        </label>
                        <p class="settings-hint">Si décoché, la page sera masquée quand aucun événement n'est disponible</p>
                    </div>
                </div>
                <div class="settings-modal-footer">
                    <button class="btn-cancel" @click="showSettings = false">Annuler</button>
                    <button
                        class="btn-save"
                        @click="saveSettings"
                        :disabled="settingsSaving"
                    >
                        {{ settingsSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <AdminEventManager :open="showEventManager" @close="showEventManager = false" />

</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from "vue";
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
    updateVisibility,
    resetResponsive,
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
    addBlock,
    localBlocksPage,
} = useAdmin();

const { saveMenuToFirestore, customPages, loadCustomPages } = useMenuEditor();

// Titre « propre » de la page courante (celui affiché dans la liste
// déroulante), renvoyé au serveur à chaque sauvegarde pour réparer les
// pages dont le titre a été écrasé
const knownPageTitle = computed(() => {
    const page = customPages.value.find(p => p.slug === props.pageSlug)
    return page && page.title && page.title !== page.slug ? page.title : ''
})

const { $auth } = useNuxtApp();

// ─── Block picker ─────────────────────────────────────────────────────────────
const showBlockPicker = ref(false)
const showTemplatePicker = ref(false)
const pendingBlockType = ref(null)

const pickableBlockTypes = computed(() =>
    Object.entries(BLOCK_TYPES)
        .filter(([key]) => key !== 'footer')
        .map(([key, def]) => ({ key, label: def.label || key, icon: def.icon || '📦', category: def.category || 'other' }))
)

// Types with >1 template show a 2nd step (template chooser) before adding
// the block; types with none/one template are added immediately as before.
function pickBlock(type) {
    if (BLOCK_TYPES[type]?.templates?.length) {
        pendingBlockType.value = type
        showBlockPicker.value = false
        showTemplatePicker.value = true
        return
    }
    showBlockPicker.value = false
    finalizeAddBlock(type)
}

async function finalizeAddBlock(type, overrideProps) {
    const newBlock = await addBlock(type, activeBlock.value?.id, overrideProps)
    if (newBlock) selectBlock(newBlock.id)
}

function pickTemplate(tpl) {
    showTemplatePicker.value = false
    const type = pendingBlockType.value
    pendingBlockType.value = null
    finalizeAddBlock(type, tpl.props)
}

function backToBlockPicker() {
    showTemplatePicker.value = false
    pendingBlockType.value = null
    showBlockPicker.value = true
}

function setDevice(device) {
  previewDevice.value = device
  const newQuery = { ...route.query, device }
  router.replace({ query: newQuery }).catch(() => {})
}

// ─── Responsive / per-device controls (sidebar) ───
const DEVICE_LABELS = { desktop: 'Ordinateur', tablet: 'Tablette', mobile: 'Mobile' }
const DEVICE_ICONS = { desktop: '🖥', tablet: '▭', mobile: '▯' }
function deviceLabel(d) { return DEVICE_LABELS[d] || d }
function deviceIcon(d) { return DEVICE_ICONS[d] || '•' }

function deviceVisible(d) {
  const v = sidebarBlock.value?.visibility
  return v?.[d] !== false
}

function toggleDeviceVisibility(d) {
  const block = sidebarBlock.value
  if (!block?.id) return
  updateVisibility(block.id, { [d]: deviceVisible(d) === false })
}

const otherDevices = computed(() =>
  ['desktop', 'tablet', 'mobile'].filter((d) => d !== previewDevice.value)
)

const hasDeviceOverrides = computed(() => {
  const block = activeBlock.value
  const dev = previewDevice.value
  if (!block || dev === 'desktop') return false
  const o = block.responsive?.[dev]
  return Boolean(o && Object.keys(o).length)
})

function resetCurrentDeviceOverrides() {
  const block = activeBlock.value
  if (!block?.id || previewDevice.value === 'desktop') return
  resetResponsive(block.id, previewDevice.value)
}
const user = ref(null);
const saving = ref(false);
const saveStatus = ref("");

// Admin access control
const isAdminUser = ref(false);
const checkingAdmin = ref(true);

let unsubscribe = null;
let autoSaveTimer = null;

// ─── Developer comments (per-block note) ───
const pageComments = ref([]) // toutes les demandes de la page courante (chargées à la demande)
const commentDraft = ref('')
const savingComment = ref(false)
// Même ref réactive que layouts/default.vue provide/injecte pour le badge
// 💬 sur les blocs (PageRenderer.vue) — la mettre à jour ici évite d'attendre
// un changement de page pour que le badge reflète une création/résolution
// tout juste faite dans cette même session d'édition.
const commentBlockIds = inject('commentBlockIds', ref([]))

const activeComment = computed(() =>
    pageComments.value.find(c => c.blockId === sidebarBlock.value?.id && !c.resolved) ||
    pageComments.value.find(c => c.blockId === sidebarBlock.value?.id) || null
)

watch(sidebarBlock, async (block) => {
    commentDraft.value = ''
    if (!block) return
    await loadPageComments()
    commentDraft.value = activeComment.value?.message || ''
})

async function loadPageComments() {
    try {
        const token = await getFirebaseToken()
        const res = await fetch('/api/comments', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        pageComments.value = (data.comments || []).filter(c => c.pageSlug === props.pageSlug)
        commentBlockIds.value = pageComments.value.filter(c => !c.resolved).map(c => c.blockId)
    } catch (e) {
        console.error('[admin] load comments failed:', e)
    }
}

async function saveComment() {
    const block = sidebarBlock.value
    if (!block || !commentDraft.value.trim()) return
    savingComment.value = true
    try {
        const token = await getFirebaseToken()
        if (activeComment.value) {
            const res = await fetch(`/api/comments/${activeComment.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ resolved: activeComment.value.resolved, message: commentDraft.value.trim() }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
        } else {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    pageSlug: props.pageSlug,
                    blockId: block.id,
                    blockType: block.type,
                    blockLabel: getBlockLabel(block.type),
                    message: commentDraft.value.trim(),
                }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
        }
        await loadPageComments()
        showToast('Note enregistrée', 'toast-success')
    } catch (e) {
        showToast('Erreur : ' + (e.message || e), 'toast-error')
    } finally {
        savingComment.value = false
    }
}

async function toggleCommentResolved(resolved) {
    if (!activeComment.value) return
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/comments/${activeComment.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ resolved }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await loadPageComments()
    } catch (e) {
        showToast('Erreur : ' + (e.message || e), 'toast-error')
    }
}

async function deleteActiveComment() {
    if (!activeComment.value || !confirm('Supprimer cette demande ?')) return
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/comments/${activeComment.value.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        commentDraft.value = ''
        await loadPageComments()
    } catch (e) {
        showToast('Erreur : ' + (e.message || e), 'toast-error')
    }
}

// Liste centralisée des demandes (modale "💬 Demandes"), toutes pages confondues
const showComments = ref(false)
const allComments = ref([])
const commentsLoading = ref(false)

const unresolvedCommentCount = computed(() => allComments.value.filter(c => !c.resolved).length)
const sortedComments = computed(() =>
    [...allComments.value].sort((a, b) => {
        if (a.resolved !== b.resolved) return a.resolved ? 1 : -1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
)

watch(showComments, (show) => { if (show) loadAllComments() })

async function loadAllComments() {
    commentsLoading.value = true
    try {
        const token = await getFirebaseToken()
        const res = await fetch('/api/comments', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        allComments.value = data.comments || []
    } catch (e) {
        console.error('[admin] load comments failed:', e)
        allComments.value = []
    } finally {
        commentsLoading.value = false
    }
}

async function toggleGlobalCommentResolved(c) {
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/comments/${c.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ resolved: !c.resolved }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await loadAllComments()
        if (c.pageSlug === props.pageSlug) await loadPageComments()
    } catch (e) {
        showToast('Erreur : ' + (e.message || e), 'toast-error')
    }
}

async function deleteGlobalComment(id) {
    if (!confirm('Supprimer cette demande ?')) return
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        allComments.value = allComments.value.filter(x => x.id !== id)
        await loadPageComments()
    } catch (e) {
        showToast('Erreur : ' + (e.message || e), 'toast-error')
    }
}

function goToComment(c) {
    showComments.value = false
    navigateToPage(c.pageSlug, c.blockId)
}

// Charge le compte de demandes non résolues dès l'auth admin confirmée,
// pour que le badge sur "💬 Demandes" soit visible sans ouvrir la modale.
watch(isAdminUser, (val) => { if (val) loadAllComments() }, { immediate: true })

// ─── Messages de contact (lecture seule, pas de réponse depuis l'admin) ───
const showContactMessages = ref(false)
const contactMessages = ref([])
const contactMessagesLoading = ref(false)
const contactMessageFilter = ref('all') // 'all', 'unread', 'archived'
const contactMessageSort = ref('date-desc') // 'date-desc', 'date-asc', 'sender'

const unreadContactCount = computed(() => contactMessages.value.filter(m => m.status !== 'read').length)
const archivedContactCount = computed(() => contactMessages.value.filter(m => m.status === 'archived').length)
const newsletterSubscriberCount = computed(() => contactMessages.value.filter(m => m.newsletter === true).length)

const filteredContactMessages = computed(() => {
  let filtered = contactMessages.value

  if (contactMessageFilter.value === 'unread') {
    filtered = filtered.filter(m => m.status !== 'read')
  } else if (contactMessageFilter.value === 'archived') {
    filtered = filtered.filter(m => m.status === 'archived')
  }

  // Tri
  const sorted = [...filtered]
  if (contactMessageSort.value === 'date-desc') {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else if (contactMessageSort.value === 'date-asc') {
    sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else if (contactMessageSort.value === 'sender') {
    sorted.sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`))
  }

  return sorted
})

watch(isAdminUser, (val) => { if (val) loadContactMessages() }, { immediate: true })

async function loadContactMessages() {
    contactMessagesLoading.value = true
    try {
        const token = await getFirebaseToken()
        const res = await fetch('/api/contacts', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        contactMessages.value = (data.contacts || []).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    } catch (e) {
        console.error('[admin] load contact messages failed:', e)
        contactMessages.value = []
    } finally {
        contactMessagesLoading.value = false
    }
}

function openContactMessages() {
    showContactMessages.value = true
    loadContactMessages()
}

async function toggleContactRead(message) {
    try {
        const token = await getFirebaseToken()
        const newStatus = message.status === 'read' ? 'new' : 'read'
        const res = await fetch(`/api/contacts/${message.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        message.status = newStatus
    } catch (e) {
        console.error('[admin] toggle read failed:', e)
        showToast('Erreur lors de la mise à jour', 'toast-error')
    }
}

async function toggleContactArchived(message) {
    try {
        const token = await getFirebaseToken()
        const newStatus = message.status === 'archived' ? 'new' : 'archived'
        const res = await fetch(`/api/contacts/${message.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        message.status = newStatus
    } catch (e) {
        console.error('[admin] toggle archived failed:', e)
        showToast('Erreur lors de la mise à jour', 'toast-error')
    }
}

// Settings
const showSettings = ref(false)
const settingsForm = ref({ contactEmail: '', showEventsPage: true })
const settingsSaving = ref(false)

watch(showSettings, async (show) => {
  if (show) await loadSettings()
})

async function loadSettings() {
  try {
    const res = await fetch('/api/settings')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    settingsForm.value = { contactEmail: data.contactEmail }
  } catch (e) {
    console.error('[admin] load settings failed:', e)
    showToast('Erreur : ' + (e.message || e), 'toast-error')
  }
}

async function saveSettings() {
  if (!settingsForm.value.contactEmail) {
    showToast('Email requis', 'toast-error')
    return
  }
  settingsSaving.value = true
  try {
    const token = await getFirebaseToken()
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settingsForm.value),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message || `HTTP ${res.status}`)
    }
    showToast('Configuration sauvegardée', 'toast-success')
    showSettings.value = false
  } catch (e) {
    console.error('[admin] save settings failed:', e)
    showToast('Erreur : ' + (e.message || e), 'toast-error')
  } finally {
    settingsSaving.value = false
  }
}

// Version history
const showVersionHistory = ref(false);
const versions = ref([]);
const versionsLoading = ref(false);
const restoring = ref(null);
const expandedVersion = ref(null);
const deletingVersion = ref(null);

function toggleVersionExpand(id) {
    expandedVersion.value = expandedVersion.value === id ? null : id
}

async function deleteVersion(versionId) {
    if (!confirm('Supprimer cette version ?')) return
    deletingVersion.value = versionId
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/pages/${props.pageSlug}/versions/${versionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        versions.value = versions.value.filter(v => v.id !== versionId)
        if (expandedVersion.value === versionId) expandedVersion.value = null
    } catch (e) {
        console.error('[admin] deleteVersion failed:', e)
        showToast("Erreur : " + (e.message || e), 'toast-error')
    } finally {
        deletingVersion.value = null
    }
}

watch(showVersionHistory, (show) => {
    if (show) loadVersions()
})

async function loadVersions() {
    versionsLoading.value = true
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/pages/${props.pageSlug}/versions`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
            const body = await res.json().catch(() => null)
            throw new Error(body?.message || `HTTP ${res.status}`)
        }
        const data = await res.json()
        versions.value = data.versions || []
    } catch (e) {
        console.error('[admin] load versions failed:', e)
        versions.value = []
        // Distingue "0 version" (état normal) d'une erreur de chargement —
        // sans ça l'admin voit juste "Aucune version" et pense que la
        // fonctionnalité n'existe pas alors qu'il y a une vraie erreur.
        showToast('Impossible de charger l\'historique : ' + (e.message || e), 'toast-error')
    } finally {
        versionsLoading.value = false
    }
}

async function restoreVersion(versionId) {
    restoring.value = versionId
    try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/pages/${props.pageSlug}/versions/${versionId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        })
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

function getBlockTypesLabel(typeCounts) {
    if (!typeCounts) return ''
    return Object.entries(typeCounts).map(([type, count]) => {
        const label = BLOCK_TYPES[type]?.label || type
        return count > 1 ? `${label} ×${count}` : label
    }).join(', ')
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
const showEventManager = ref(false);
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

    if (!customPages.value.length) loadCustomPages();
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
    // Garde-fou anti-corruption : localBlocks (composable partagé, mis à jour de façon
    // asynchrone par la page qui vient de charger) peut rester momentanément sur
    // l'ancienne page pendant que props.pageSlug (piloté par la route, synchrone) a déjà
    // changé — ex. sauvegarde différée (3s) qui se déclenche après une navigation.
    // Sans ce contrôle, on écrirait le contenu de l'ancienne page sur le slug de la
    // nouvelle (constaté en prod : accueil écrasé par le contenu de messages).
    if (localBlocksPage.value !== props.pageSlug) {
        console.warn(`[admin] Sauvegarde annulée : localBlocksPage="${localBlocksPage.value}" ne correspond pas à props.pageSlug="${props.pageSlug}"`)
        throw new Error('page-mismatch')
    }
    const token = await getFirebaseToken()
    if (!token) throw new Error('Non authentifié')
    try {
        const res = await fetch(`/api/pages/${props.pageSlug}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                blocks: localBlocks.value,
                // Renvoie le titre connu pour réparer les pages dont le titre
                // a été écrasé par d'anciennes sauvegardes
                title: knownPageTitle.value || undefined,
            }),
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
        // Changement de page pendant le délai de sauvegarde différée : ce n'est pas une
        // vraie erreur, juste un skip volontaire. La page nouvellement affichée relancera
        // son propre cycle d'auto-save si besoin. Pas de markSaved() : les changements
        // restent "non sauvegardés" pour l'ancienne page tant qu'on ne l'a pas revisitée.
        if (e.message === 'page-mismatch') return;
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
            const key = fieldKeysWithImages.value[0];
            if (!key) return;
            if (fieldKeysImagesArray.value.includes(key)) {
                const existing = sidebarBlock.value.props?.[key] ?? [];
                const newArray = Array.isArray(existing) ? [...existing, url] : [url];
                if (editingFooter.value) {
                    updateFooterBlock({ [key]: newArray });
                } else {
                    updateBlock(sidebarBlock.value.id, { [key]: newArray });
                }
            } else {
                if (editingFooter.value) {
                    updateFooterBlock({ [key]: url });
                } else {
                    updateBlock(sidebarBlock.value.id, { [key]: url });
                }
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
    return schema.filter((f) => f.type === "image" || f.type === "images").map((f) => f.key);
});

const fieldKeysImagesArray = computed(() => {
    if (!sidebarBlock.value) return [];
    const schema = sidebarSchema.value;
    return schema.filter((f) => f.type === "images").map((f) => f.key);
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
    if (!sidebarBlock.value) return;
    const key = fieldKeysWithImages.value[0];
    if (!key) return;
    if (fieldKeysImagesArray.value.includes(key)) {
        const existing = sidebarBlock.value.props?.[key] ?? [];
        const newArray = Array.isArray(existing) ? [...existing, url] : [url];
        if (editingFooter.value) {
            updateFooterBlock({ [key]: newArray });
        } else {
            updateBlock(sidebarBlock.value.id, { [key]: newArray });
        }
    } else {
        if (editingFooter.value) {
            updateFooterBlock({ [key]: url });
        } else {
            updateBlock(sidebarBlock.value.id, { [key]: url });
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


async function navigateToPage(slug, focusBlockId) {
    // Sauter vers un bloc précis (depuis la modale Demandes) : portée v1
    // limitée au desktop — la préview tablette/mobile passe par un iframe,
    // relayer focusBlock jusque dans son contexte est une extension possible
    // mais pas nécessaire pour ce premier jet. On bascule en desktop d'abord.
    if (focusBlockId && previewDevice.value !== "desktop") {
        previewDevice.value = "desktop"
    }
    if (previewDevice.value !== "desktop") {
        emit('navigate-preview', slug)
        return
    }
    // Desktop mode: client-side navigation
    const newQuery = { ...route.query, admin: "true" };
    delete newQuery.device;
    if (focusBlockId) newQuery.focusBlock = focusBlockId
    else delete newQuery.focusBlock
    try {
        await router.push({ path: slug === "accueil" ? "/" : `/${slug}`, query: newQuery });
        if (!focusBlockId) { try { window.scrollTo(0, 0) } catch (e) { console.warn(e) } }
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
        await saveMenuToFirestore();
        markSaved();
        saveStatus.value = "Sauvegardé";
        setTimeout(() => {
            saveStatus.value = "";
        }, 2000);
    } catch (e) {
        console.error("Save error:", e);
        if (e.message === 'page-mismatch') {
            showToast("Page changée pendant la sauvegarde — réessaie depuis la page actuelle.", 'toast-error');
        } else {
            showToast("Erreur lors de la sauvegarde : " + (e.message || e), 'toast-error');
        }
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
/* ─── Developer comment panel (sidebar) ─── */
.admin-comment-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 14px;
    background: #fffbea;
}
.admin-comment-label {
    font-size: 0.72em;
    font-weight: 600;
    color: #92400e;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 8px;
}
.admin-comment-textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px;
    font-size: 0.85em;
    font-family: inherit;
    resize: vertical;
}
.admin-comment-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    flex-wrap: wrap;
}
.admin-comment-del-btn {
    background: none;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #b91c1c;
    cursor: pointer;
    padding: 0 10px;
}
.admin-comment-del-btn:hover { background: #fef2f2; }
.admin-comment-resolved-note {
    margin: 8px 0 0;
    font-size: 0.72em;
    color: #16a34a;
}
.admin-comment-count, .admin-msg-count {
    display: inline-block;
    margin-left: 4px;
    background: #ef4444;
    color: white;
    border-radius: 10px;
    padding: 1px 6px;
    font-size: 0.85em;
}
.comment-resolved {
    opacity: 0.55;
}
.comment-resolved .version-meta {
    text-decoration: line-through;
}

/* ─── Responsive panel (sidebar) ─── */
.admin-responsive-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 14px;
    background: #fafafc;
}
.admin-responsive-label {
    font-size: 0.72em;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 8px;
}
.admin-vis-btn {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.78em;
    color: #374151;
    transition: all 0.15s;
}
.admin-vis-btn:hover { border-color: #3b82f6; }
.admin-vis-btn.off {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
    opacity: 0.85;
}
.admin-vis-icon { font-size: 1.1em; }
.admin-vis-state { font-size: 0.85em; }
.admin-vis-others {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    justify-content: center;
}
.admin-vis-mini {
    font-size: 0.68em;
    color: #9ca3af;
    cursor: default;
}
.admin-vis-mini.off { color: #b91c1c; }
.admin-responsive-editing {
    margin-top: 10px;
    padding: 8px;
    border-radius: 6px;
    background: #eff6ff;
    color: #1e40af;
    font-size: 0.74em;
    line-height: 1.4;
}
.admin-responsive-editing strong { text-transform: capitalize; }
.admin-reset-overrides {
    display: inline-block;
    margin-top: 6px;
    padding: 3px 8px;
    border: 1px solid #93c5fd;
    border-radius: 5px;
    background: #fff;
    color: #1e40af;
    font-size: 0.95em;
    cursor: pointer;
}
.admin-reset-overrides:hover { background: #dbeafe; }
.admin-responsive-hint {
    margin: 8px 0 0;
    font-size: 0.72em;
    color: #9ca3af;
    line-height: 1.4;
}
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
.admin-btn-compact {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
}
.admin-btn-compact .label {
    display: none;
}
.admin-btn-compact:hover .label {
    display: inline;
}
.admin-btn-compact .icon {
    font-size: 1.1em;
}

.contact-filters {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.filter-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8em;
    cursor: pointer;
    transition: all 0.15s;
}

.filter-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
}

.filter-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.contact-sort {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 0.8em;
}

.sort-select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    cursor: pointer;
}

.sort-select option {
    background: #1a1a2e;
    color: white;
}

.version-item.is-archived {
    opacity: 0.6;
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
    border: 1px solid #e5e7eb;
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
/* .version-item moved above with expandable layout */
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
.version-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
}
.version-blocks {
    font-size: 11px;
    color: #666;
    font-weight: 500;
}
.version-types {
    font-size: 11px;
    color: #555;
}
.version-diff {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
    align-items: baseline;
}
.vd-added, .vd-removed, .vd-modified {
    font-size: 11px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
}
.vd-added { color: #059669; background: #ecfdf5; }
.vd-removed { color: #dc2626; background: #fef2f2; }
.vd-modified { color: #d97706; background: #fffbeb; }
.vd-detail {
    font-size: 10px;
    color: #6b7280;
    font-style: italic;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.vd-added-detail { color: #059669; }
.vd-removed-detail { color: #dc2626; }
.version-current {
    font-size: 10px;
    font-weight: 700;
    color: #2563eb;
    background: #eff6ff;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
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
    flex: 1;
    min-width: 0;
}
.admin-mgr-del-btn {
    flex-shrink: 0;
    padding: 2px 7px;
    border: 1px solid #fecaca;
    border-radius: 4px;
    background: white;
    color: #ef4444;
    cursor: pointer;
    font-size: 11px;
    line-height: 1.4;
    white-space: nowrap;
    margin-left: 8px;
}
.admin-mgr-del-btn:hover { background: #fef2f2; }
.admin-mgr-del-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Version history expandable */
.version-item {
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;
}
.version-item-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
}
.version-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.version-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    flex-shrink: 0;
}
.version-restore-btn { font-size: 0.78em; padding: 4px 10px; }
.version-del-btn {
    background: none;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #ef4444;
    cursor: pointer;
    font-size: 10px;
    padding: 2px 6px;
    line-height: 1.4;
}
.version-del-btn:hover { background: #fef2f2; }
.version-del-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.version-expand-arrow { font-size: 10px; color: #9ca3af; margin-left: 4px; }
.version-detail-panel {
    padding: 8px 12px 10px;
    border-top: 1px solid #e5e7eb;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.vd-detail-group { display: flex; flex-wrap: wrap; gap: 4px; align-items: baseline; }
.vd-detail-label {
    font-size: 10px; font-weight: 700; color: #9ca3af;
    text-transform: uppercase; letter-spacing: 0.04em;
    width: 100%; margin-bottom: 2px;
}
.vd-detail-item {
    font-size: 11px; padding: 2px 6px; border-radius: 3px;
}
.vd-no-detail { font-size: 11px; color: #9ca3af; margin: 0; font-style: italic; }

/* Block picker */
.block-picker-modal {
    max-width: 640px;
}
.block-picker-subtitle {
    margin: 2px 0 0;
    font-size: 12px;
    color: #888;
}
.block-picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
}
.block-picker-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fafafa;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    font-family: inherit;
}
.block-picker-card:hover {
    background: #eff6ff;
    border-color: #3b82f6;
    transform: translateY(-2px);
}
.block-picker-icon {
    font-size: 24px;
    line-height: 1;
}
.block-picker-label {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    text-align: center;
    line-height: 1.3;
}
.block-picker-back {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 0 0 12px;
    font-family: inherit;
}
.block-picker-back:hover {
    text-decoration: underline;
}
.admin-btn-add-block {
    background: #10b981;
    color: white;
}
.admin-btn-add-block:hover {
    background: #059669;
}

/* Settings Modal */
.settings-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
.settings-modal {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
.settings-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}
.settings-modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}
.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
}
.settings-modal-body {
    padding: 20px;
}
.settings-field {
    margin-bottom: 16px;
}
.settings-field label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}
.settings-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
}
.settings-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.settings-hint {
    margin: 6px 0 0 0;
    font-size: 13px;
    color: #6b7280;
}
.settings-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
}
.settings-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.settings-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 20px;
    border-top: 1px solid #e5e7eb;
}
.btn-cancel, .btn-save {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}
.btn-cancel {
    background: #e5e7eb;
    color: #374151;
}
.btn-cancel:hover {
    background: #d1d5db;
}
.btn-save {
    background: #3b82f6;
    color: white;
}
.btn-save:hover:not(:disabled) {
    background: #2563eb;
}
.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Contact Stats */
.contact-stats {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 12px;
}
.stat-item {
    flex: 1;
    text-align: center;
    padding: 8px;
    background: #f9fafb;
    border-radius: 4px;
}
.stat-label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 4px;
}
.stat-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #3b82f6;
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
