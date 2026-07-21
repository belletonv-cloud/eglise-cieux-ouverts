// Partagé entre versions.get.ts (Firestore réel) et le mode mock, pour que
// le calcul de diff/résumé soit identique dans les deux environnements.

export function summarizeBlocks(blocks) {
  const typeCounts = {}
  for (const b of (blocks || [])) {
    const t = b?.type || 'inconnu'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  return { blockCount: blocks?.length || 0, typeCounts }
}

export function blockLabel(b) {
  const t = b?.type || 'inconnu'
  const p = b?.props || {}
  const rawTitle = p.title || p.heading || p.name || ''
  if (rawTitle) return `${t} « ${rawTitle} »`
  const rawContent = p.content || p.text || p.description || ''
  if (rawContent) {
    const stripped = String(rawContent).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)
    if (stripped) return `${t} « ${stripped}${stripped.length >= 40 ? '…' : ''} »`
  }
  return t
}

export function computeChanges(newerBlocks, olderBlocks) {
  const newMap = new Map(newerBlocks.filter(b => b?.id).map(b => [b.id, b]))
  const oldMap = new Map(olderBlocks.filter(b => b?.id).map(b => [b.id, b]))

  // { id, label } plutôt que juste le label affiché : le filtre par bloc
  // (frontend) a besoin de l'id du bloc pour matcher de façon fiable, le
  // label (type + titre) n'étant qu'un texte d'affichage qui ne contient
  // jamais l'id réel du bloc.
  const added = []
  const removed = []
  const modified = []

  for (const [id, nb] of newMap) {
    if (!oldMap.has(id)) {
      added.push({ id, label: blockLabel(nb) })
    } else {
      const ob = oldMap.get(id)
      if (JSON.stringify(nb.props) !== JSON.stringify(ob.props) ||
          JSON.stringify(nb.visibility) !== JSON.stringify(ob.visibility) ||
          JSON.stringify(nb.responsive) !== JSON.stringify(ob.responsive)) {
        modified.push({ id, label: blockLabel(nb) })
      }
    }
  }
  for (const [id, ob] of oldMap) {
    if (!newMap.has(id)) removed.push({ id, label: blockLabel(ob) })
  }

  if (newMap.size === 0 && oldMap.size === 0) {
    const maxLen = Math.max(newerBlocks.length, olderBlocks.length)
    for (let i = 0; i < maxLen; i++) {
      if (i >= newerBlocks.length) { removed.push({ id: olderBlocks[i]?.id ?? `idx-${i}`, label: blockLabel(olderBlocks[i]) }); continue }
      if (i >= olderBlocks.length) { added.push({ id: newerBlocks[i]?.id ?? `idx-${i}`, label: blockLabel(newerBlocks[i]) }); continue }
      if (JSON.stringify(newerBlocks[i]) !== JSON.stringify(olderBlocks[i])) {
        modified.push({ id: newerBlocks[i]?.id ?? `idx-${i}`, label: blockLabel(newerBlocks[i]) })
      }
    }
  }

  const parts = []
  if (added.length) parts.push(`+${added.length}`)
  if (removed.length) parts.push(`-${removed.length}`)
  if (modified.length) parts.push(`~${modified.length}`)
  if (!parts.length && newerBlocks.length) parts.push(`${newerBlocks.length} blocs (inchangés)`)

  return {
    added: added.length,
    removed: removed.length,
    modified: modified.length,
    summary: parts.join(' '),
    details: { added, removed, modified },
  }
}

// Construit la liste { id, savedAt, savedBy, blockCount, blockTypes, changes }
// à partir d'une liste brute de versions (plus ancien en premier).
export function buildVersionsResponse(parsed) {
  parsed.sort((a, b) => {
    if (!a.savedAt) return 1
    if (!b.savedAt) return -1
    return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
  })

  const versions = parsed.map((v, i) => {
    const { blockCount, typeCounts } = summarizeBlocks(v.blocks)
    let changes = null
    if (i > 0) {
      changes = computeChanges(v.blocks, parsed[i - 1].blocks)
    }
    return {
      id: v.id,
      savedAt: v.savedAt,
      savedBy: v.savedBy,
      blockCount,
      blockTypes: typeCounts,
      changes,
    }
  })

  versions.reverse()
  return versions
}
