import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByText('Yari 2D')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: '操作' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'リスト' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '+ 新規' })).toHaveLength(2)
  })

  it('shows empty gear helper text', async () => {
    mockedGetGearItems.mockResolvedValue([])
    mockedGetLists.mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('まだギアがありません。最初のギアを追加しましょう。')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: '最初のギアを追加' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: '最初のリストを作成' })).toBeInTheDocument()
  })

  it('opens create list dialog from packing lists card action', async () => {
    const user = userEvent.setup()
    mockedGetGearItems.mockResolvedValue([])
    mockedGetLists.mockResolvedValue([])

    renderPage()

    await user.click(await screen.findByRole('button', { name: '最初のリストを作成' }))

    expect(screen.getByRole('heading', { name: 'パッキングリストを作成' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'リストを作成' })).toBeInTheDocument()
  })

  it('opens add gear dialog from my gear empty state action', async () => {
    const user = userEvent.setup()
    mockedGetGearItems.mockResolvedValue([])
    mockedGetLists.mockResolvedValue([])

    renderPage()

    await user.click(await screen.findByRole('button', { name: '最初のギアを追加' }))

    expect(screen.getByRole('heading', { name: 'ギアを追加' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ギア追加' })).toBeInTheDocument()
  })
})
