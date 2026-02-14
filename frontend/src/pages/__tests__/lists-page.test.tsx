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
      getLists: vi.fn(),
      createList: vi.fn(),
    },
  }
})

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

  it('shows packing lists only', async () => {
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

    expect(await screen.findByText('Yari 2D')).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: '操作' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'リスト' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '+ 新規' })).toHaveLength(1)
    expect(screen.queryByText('マイギア')).not.toBeInTheDocument()
  })

  it('shows empty packing list helper text', async () => {
    mockedGetLists.mockResolvedValue([])

    renderPage()

    expect(await screen.findByRole('button', { name: '最初のリストを作成' })).toBeInTheDocument()
  })

  it('opens create list dialog from packing lists card action', async () => {
    const user = userEvent.setup()
    mockedGetLists.mockResolvedValue([])

    renderPage()

    await user.click(await screen.findByRole('button', { name: '最初のリストを作成' }))

    expect(screen.getByRole('heading', { name: 'パッキングリストを作成' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'リストを作成' })).toBeInTheDocument()
  })
})
