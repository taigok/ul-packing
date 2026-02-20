import type {
  ApiErrorBody,
  GearListItem,
  PackingList,
  PackingListDetail,
  SharedPackingList,
  Unit,
} from '@/lib/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

class ApiError extends Error {
  code: string
  details?: unknown

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
    this.details = body.details
  }
}

const apiErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json()) as { data?: T; error?: ApiErrorBody }

  if (!response.ok || payload.error) {
    throw new ApiError(
      payload.error ?? {
        code: 'unknown_error',
        message: 'Request failed',
      },
    )
  }

  if (typeof payload.data === 'undefined') {
    throw new ApiError({ code: 'invalid_response', message: 'API response has no data field' })
  }

  return payload.data
}

const requestWithBody = <T>(path: string, method: 'POST' | 'PATCH', body: object) =>
  request<T>(path, {
    method,
    body: JSON.stringify(body),
  })

const listPath = (listId: string, suffix = '') => `/api/v1/lists/${listId}${suffix}`

export type ListPayload = {
  title: string
  description: string
}

export type ItemPayload = {
  name: string
  category: string
  weight_grams: number
  quantity: number
  kind: string
  notes: string
}

export const api = {
  getLists: () => request<PackingList[]>('/api/v1/lists'),
  getGearItems: () => request<GearListItem[]>('/api/v1/gear-items'),
  createGearItem: (payload: ItemPayload) => requestWithBody<GearListItem>('/api/v1/gear-items', 'POST', payload),
  createList: (payload: ListPayload) => requestWithBody<PackingList>('/api/v1/lists', 'POST', payload),
  updateList: (listId: string, payload: ListPayload) => requestWithBody<PackingList>(listPath(listId), 'PATCH', payload),
  getList: (listId: string) => request<PackingListDetail>(listPath(listId)),
  createItem: (listId: string, payload: ItemPayload) => requestWithBody<PackingListDetail>(listPath(listId, '/items'), 'POST', payload),
  updateItem: (listId: string, itemId: string, payload: ItemPayload) =>
    requestWithBody<PackingListDetail>(listPath(listId, `/items/${itemId}`), 'PATCH', payload),
  deleteItem: (listId: string, itemId: string) =>
    request<PackingListDetail>(listPath(listId, `/items/${itemId}`), { method: 'DELETE' }),
  setUnit: (listId: string, unit: Unit) =>
    requestWithBody<PackingListDetail>(listPath(listId, '/unit'), 'PATCH', { unit }),
  getShared: (token: string) => request<SharedPackingList>(`/api/v1/shared/${token}`),
  regenerateShareToken: (listId: string) =>
    request<PackingListDetail>(listPath(listId, '/share/regenerate'), { method: 'POST' }),
}

export { ApiError }
export { apiErrorMessage }
