import { getFirestoreConfig, getAccessToken, parseFirestoreDoc } from '../../../utils/firebase'

function summarizeBlocks(blocks: any[]) {
  const typeCounts: Record<string, number> = {}
  for (const b of (blocks || [])) {
    const t = b?.type || 'inconnu'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  return { blockCount: blocks?.length || 0, typeCounts }
}

function computeChanges(newerBlocks: any[], olderBlocks: any[]) {
  const newTypes = newerBlocks.map(b => b?.type || 'inconnu')
  const oldTypes = olderBlocks.map(b => b?.type || 'inconnu')

  // Compare position by position
  const maxLen = Math.max(newTypes.length, oldTypes.length)
  let modified = 0
  let added = 0
  let removed = 0

  for (let i = 0; i < maxLen; i++) {
    if (i >= newTypes.length) { removed++; continue }
    if (i >= oldTypes.length) { added++; continue }
    if (newTypes[i] !== oldTypes[i]) modified++
  }

  const parts: string[] = []
  if (added) parts.push(`+${added}`)
  if (removed) parts.push(`-${removed}`)
  if (modified) parts.push(`~${modified}`)
  if (!parts.length) { added = newerBlocks.length; parts.push(`+${added}`) }

  return { added, removed, modified, summary: parts.join(' ') }
}

export default defineEventHandler(async (event) => {
  const config = getFirestoreConfig(event)
  if (!config) {
    throw createError({ statusCode: 500, message: 'Firestore non configuré' })
  }

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
