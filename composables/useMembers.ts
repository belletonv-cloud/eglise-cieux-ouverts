import { ref, computed } from 'vue'

interface Member {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  birth_date?: string
  membership_type: string
  baptism_date?: string
  role?: string
  teams?: Array<{ id: number; name: string; description?: string; position?: string }>
  created_at?: string
  updated_at?: string
  // Admin-only fields (if user has permission)
  notes?: string
  consent_data_sharing?: boolean
  consent_photo?: boolean
  consent_communication?: boolean
}

interface MembersResponse {
  data: Member[]
  page: number
  size: number
  totalCount: number
}

export function useMembers() {
  const members = ref<Member[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const size = ref(25)
  const totalCount = ref(0)
  const searchQuery = ref('')
  const teamIdFilter = ref('')

  const totalPages = computed(() => Math.ceil(totalCount.value / size.value))

  async function loadMembers() {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({
        page: String(page.value),
        size: String(size.value),
        ...(searchQuery.value && { q: searchQuery.value }),
        ...(teamIdFilter.value && { teamId: teamIdFilter.value }),
      })

      const res = await fetch(`/api/members?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || `HTTP ${res.status}`)
      }

      const data = await res.json() as MembersResponse
      members.value = data.data || []
      totalCount.value = data.totalCount || 0
    } catch (e: any) {
      console.error('[useMembers] load failed:', e)
      error.value = e.message || 'Erreur lors du chargement des membres'
      members.value = []
    } finally {
      loading.value = false
    }
  }

  function search(q: string) {
    searchQuery.value = q
    page.value = 1
    loadMembers()
  }

  function filterByTeam(teamId: string) {
    teamIdFilter.value = teamId
    page.value = 1
    loadMembers()
  }

  function goToPage(p: number) {
    page.value = Math.max(1, Math.min(p, totalPages.value))
    loadMembers()
  }

  return {
    members,
    loading,
    error,
    page,
    totalPages,
    size,
    totalCount,
    searchQuery,
    teamIdFilter,
    loadMembers,
    search,
    filterByTeam,
    goToPage,
  }
}
