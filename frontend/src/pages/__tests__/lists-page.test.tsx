import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ListsPage } from '@/pages/lists-page'
import { api } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: {
      ...actual.api,
      getGearItems: vi.fn(),
      getLists: vi.fn(),
      createList: vi.fn(),
      createGearItem: vi.fn(),
    },
  }
})

const mockedGetGearItems = vi.mocked(api.getGearItems)
const mockedGetLists = vi.mocked(api.getLists)
const mockedCreateList = vi.mocked(api.createList)

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
        <ListsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ListsPage', () => {
  beforeEach(() => {
    mockedCreateList.mockResolvedValue({
      id: 'new-list',
      title: 'New',
      description: '',
      unit: 'g',
      share_token: '',
      is_shared: false,
      created_at: '',
      updated_at: '',
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('shows gear and packing lists on home', async () => {
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
    mockedGetLists.mockResolvedValue([
      {
        id: 'list-1',
        title: 'Yari 2D',
        description: '2 days',
        unit: 'g',
        share_token: '',
        is_shared: false,
        created_at: '',
        updated_at: '',
      },
    ])

    renderPage()

    expect(await screen.findByText('Tent')).toBeInTheDocument()
    expect(screen.getAllByText('Yari 2D')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Open List' })).toHaveAttribute('href', '/lists/list-1')
    expect(screen.getByRole('button', { name: 'Create List' })).toBeInTheDocument()
  })

  it('shows empty gear helper text', async () => {
    mockedGetGearItems.mockResolvedValue([])
    mockedGetLists.mockResolvedValue([])

    renderPage()

    expect(
      await screen.findByText('No gear items yet. Use "Add Gear" to register your first item.'),
    ).toBeInTheDocument()
  })
})
