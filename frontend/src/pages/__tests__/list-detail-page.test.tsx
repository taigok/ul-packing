import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { api } from '@/lib/api'
import { ListDetailPage } from '@/pages/list-detail-page'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      getList: vi.fn(),
    },
  }
})

const mockedGetList = vi.mocked(api.getList)

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
      <MemoryRouter initialEntries={['/lists/list-1']}>
        <Routes>
          <Route path="/lists/:listId" element={<ListDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ListDetailPage', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows weight chart in list detail', async () => {
    mockedGetList.mockResolvedValue({
      id: 'list-1',
      title: 'Yari 2D',
      description: '2 days',
      unit: 'g',
      share_token: 'token',
      is_shared: false,
      created_at: '',
      updated_at: '',
      summary: {
        base_weight_g: 800,
        consumable_weight_g: 240,
        worn_weight_g: 250,
        total_pack_g: 1290,
      },
      items: [],
    })

    renderPage()

    expect(await screen.findByText('重量内訳グラフ')).toBeInTheDocument()
  })

  it('shows default categories and groups items under them', async () => {
    mockedGetList.mockResolvedValue({
      id: 'list-1',
      title: 'Yari 2D',
      description: '2 days',
      unit: 'g',
      share_token: 'token',
      is_shared: false,
      created_at: '',
      updated_at: '',
      summary: {
        base_weight_g: 800,
        consumable_weight_g: 0,
        worn_weight_g: 0,
        total_pack_g: 800,
      },
      items: [
        {
          id: 'item-1',
          list_id: 'list-1',
          name: 'Tent',
          category: 'shelter',
          kind: 'base',
          weight_grams: 800,
          quantity: 1,
          notes: '',
          sort_order: 0,
        },
      ],
    })

    renderPage()

    expect((await screen.findAllByText('シェルター')).length).toBeGreaterThan(0)
    expect(screen.getByText('Tent')).toBeInTheDocument()
    expect(screen.getAllByText('バックパック').length).toBeGreaterThan(0)
    expect(screen.getAllByText('このカテゴリにはまだアイテムがありません').length).toBeGreaterThan(0)
  })
})
