import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { GearPage } from '@/pages/gear-page'
import { api } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      getGearItems: vi.fn(),
    },
  }
})

const mockedGetGearItems = vi.mocked(api.getGearItems)

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GearPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('GearPage', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state', () => {
    mockedGetGearItems.mockReturnValue(new Promise(() => undefined))

    renderPage()

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('shows error state', async () => {
    mockedGetGearItems.mockRejectedValue(new Error('failed'))

    renderPage()

    expect(await screen.findByText('ギア一覧の読み込みに失敗しました。')).toBeInTheDocument()
  })

  it('shows table data with open list links', async () => {
    mockedGetGearItems.mockResolvedValue([
      {
        id: 'item-1',
        list_id: 'list-1',
        list_title: 'Yari 2D',
        name: 'Tent',
        category: 'shelter',
        kind: 'base',
        weight_grams: 800,
        quantity: 1,
        notes: '',
        sort_order: 0,
      },
    ])

    renderPage()

    expect(await screen.findByText('Tent')).toBeInTheDocument()
    expect(screen.getByText('Yari 2D')).toBeInTheDocument()
    expect(screen.getByText('800 g')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'リストを開く' })).toHaveAttribute('href', '/lists/list-1')
  })
})
