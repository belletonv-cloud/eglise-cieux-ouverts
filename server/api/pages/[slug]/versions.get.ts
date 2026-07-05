import { getFirestoreConfig, getAccessToken, parseFirestoreDoc } from '../../../utils/firebase'
import { requireAdmin } from '../../../utils/firebase-admin'

function summarizeBlocks(blocks: any[]) {
  const typeCounts: Record<string, number> = {}
  for (const b of (blocks || [])) {
    const t = b?.type || 'inconnu'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  return { blockCount: blocks?.length || 0, typeCounts }
}

function blockLabel(b: any): string {
  const t = b?.type || 'inconnu'
  const p = b?.props || {}
  const rawTitle = p.title || p.heading || p.name || ''
  if (rawTitle) return `${t} « ${rawTitle} »`
  // Strip HTML tags for richtext / content blocks
  const rawContent = p.content || p.text || p.description || ''
  if (rawContent) {
    const stripped = String(rawContent).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)
    if (stripped) return `${t} « ${stripped}${stripped.length >= 40 ? '…' : ''} »`
  }
  return t
}

function computeChanges(newerBlocks: any[], olderBlocks: any[]) {
  const newMap = new Map(newerBlocks.filter(b => b?.id).map(b => [b.id, b]))
  const oldMap = new Map(olderBlocks.filter(b => b?.id).map(b => [b.id, b]))

  const addedLabels: string[] = []
  const removedLabels: string[] = []
  const modifiedLabels: string[] = []

  for (const [id, nb] of newMap) {
    if (!oldMap.has(id)) {
      addedLabels.push(blockLabel(nb))
    } else {
      const ob = oldMap.get(id)
      if (JSON.stringify(nb.props) !== JSON.stringify(ob.props) ||
          JSON.stringify(nb.visibility) !== JSON.stringify(ob.visibility) ||
          JSON.stringify(nb.responsive) !== JSON.stringify(ob.responsive)) {
        modifiedLabels.push(blockLabel(nb))
      }
    }
  }
  for (const [id, ob] of oldMap) {
    if (!newMap.has(id)) removedLabels.push(blockLabel(ob))
  }

  // Fallback: if no IDs, compare by position
  if (newMap.size === 0 && oldMap.size === 0) {
    const maxLen = Math.max(newerBlocks.length, olderBlocks.length)
    for (let i = 0; i < maxLen; i++) {
      if (i >= newerBlocks.length) { removedLabels.push(blockLabel(olderBlocks[i])); continue }
      if (i >= olderBlocks.length) { addedLabels.push(blockLabel(newerBlocks[i])); continue }
      if (JSON.stringify(newerBlocks[i]) !== JSON.stringify(olderBlocks[i])) {
        modifiedLabels.push(blockLabel(newerBlocks[i]))
      }
    }
  }

  const parts: string[] = []
  if (addedLabels.length) parts.push(`+${addedLabels.length}`)
  if (removedLabels.length) parts.push(`-${removedLabels.length}`)
  if (modifiedLabels.length) parts.push(`~${modifiedLabels.length}`)
  if (!parts.length && newerBlocks.length) parts.push(`${newerBlocks.length} blocs (inchangés)`)

  return {
    added: addedLabels.length,
    removed: removedLabels.length,
    modified: modifiedLabels.length,
    summary: parts.join(' '),
    details: { added: addedLabels, removed: removedLabels, modified: modifiedLabels },
  }
}

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

  await requireAdmin(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug manquant' })
  }

  try {
    const accessToken = await getAccessToken(config.clientEmail, config.privateKey)

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/pages/${slug}/versions`
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return { versions: [] }
      throw new Error(`Firestore error: ${await response.text()}`)
    }

    const data = await response.json()
    const documents = data.documents || []

    // Parse all versions, keeping blocks for diff computation
    const parsed = documents.map((doc: any) => {
      const id = doc.name.split('/').pop()
      const p = parseFirestoreDoc(doc)
      return {
        id,
        savedAt: p?.savedAt || null,
        savedBy: p?.savedBy || 'inconnu',
        blocks: p?.blocks || [],
      }
    })

    // Sort oldest first for diff computation
    parsed.sort((a: any, b: any) => {
      if (!a.savedAt) return 1
      if (!b.savedAt) return -1
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
    })

    // Build response with block summary and changes
    const versions = parsed.map((v: any, i: number) => {
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

    // Reverse to newest first
    versions.reverse()

    return { versions }
  } catch (err: any) {
    console.error('Versions list error:', err)
    throw createError({ statusCode: 500, message: `Erreur lors du chargement des versions: ${err.message || err}` })
  }
})
