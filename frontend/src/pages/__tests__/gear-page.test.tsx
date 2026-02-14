import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      createGearItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
    },
  }
})

const mockedGetGearItems = vi.mocked(api.getGearItems)
const mockedCreateGearItem = vi.mocked(api.createGearItem)
const mockedUpdateItem = vi.mocked(api.updateItem)
const mockedDeleteItem = vi.mocked(api.deleteItem)

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
  beforeEach(() => {
    mockedCreateGearItem.mockResolvedValue({
      id: 'new-item',
      list_id: 'list-inventory',
      list_title: 'マイギア一覧',
      name: 'New Item',
      category: 'other',
      kind: 'base',
      weight_grams: 100,
      quantity: 1,
      notes: '',
      sort_order: 0,
    })
    mockedUpdateItem.mockResolvedValue({
      id: 'list-1',
      title: 'List 1',
      description: '',
      unit: 'g',
      share_token: '',
      is_shared: false,
      created_at: '',
      updated_at: '',
      summary: {
        base_weight_g: 0,
        consumable_weight_g: 0,
        worn_weight_g: 0,
        total_pack_g: 0,
      },
      items: [],
    })
    mockedDeleteItem.mockResolvedValue({
      id: 'list-1',
      title: 'List 1',
      description: '',
      unit: 'g',
      share_token: '',
      is_shared: false,
      created_at: '',
      updated_at: '',
      summary: {
        base_weight_g: 0,
        consumable_weight_g: 0,
        worn_weight_g: 0,
        total_pack_g: 0,
      },
      items: [],
    })
  })

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

  it('shows table data without list links', async () => {
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
    expect(screen.getByText('800 g')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'リストを開く' })).not.toBeInTheDocument()
  })

  it('can add new gear row by + 新規', async () => {
    const user = userEvent.setup()
    mockedGetGearItems.mockResolvedValue([])

    renderPage()

    await screen.findByText('まだギアがありません。')
    await user.click(await screen.findByRole('button', { name: '+ 新規' }))
    await user.type(screen.getByLabelText('新規名前'), 'Spoon')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(mockedCreateGearItem).toHaveBeenCalled()
      expect(mockedCreateGearItem.mock.calls[0]?.[0]).toEqual({
        name: 'Spoon',
        category: 'other',
        weight_grams: 1,
        quantity: 1,
        kind: 'base',
        notes: '',
      })
    })
  })

  it('can enter edit mode and auto-save on row blur', async () => {
    const user = userEvent.setup()
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

    await user.click(await screen.findByText('Tent'))
    const nameInput = screen.getByLabelText('編集名前')
    await user.clear(nameInput)
    await user.type(nameInput, 'Tent 2')
    await user.click(screen.getByText('マイギア'))

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalledWith('list-1', 'item-1', {
        name: 'Tent 2',
        category: 'shelter',
        weight_grams: 800,
        quantity: 1,
        kind: 'base',
        notes: '',
      })
    })
  })

  it('keeps edit mode and shows error when auto-save fails', async () => {
    const user = userEvent.setup()
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
    mockedUpdateItem.mockRejectedValue(new Error('update failed'))

    renderPage()

    await user.click(await screen.findByText('Tent'))
    const nameInput = screen.getByLabelText('編集名前')
    await user.clear(nameInput)
    await user.type(nameInput, 'Tent 2')
    await user.click(screen.getByText('マイギア'))

    await waitFor(() => {
      expect(mockedUpdateItem).toHaveBeenCalled()
    })
    expect(await screen.findByText('ギアの更新に失敗しました')).toBeInTheDocument()
    expect(screen.getByLabelText('編集名前')).toBeInTheDocument()
  })

  it('can delete item', async () => {
    const user = userEvent.setup()
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

    await user.click(await screen.findByRole('button', { name: '削除' }))

    await waitFor(() => {
      expect(mockedDeleteItem).toHaveBeenCalledWith('list-1', 'item-1')
    })
  })

  it('keeps editing same row when validation error exists', async () => {
    const user = userEvent.setup()
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
      {
        id: 'item-2',
        list_id: 'list-2',
        list_title: 'Kita',
        name: 'Pack',
        category: 'backpack',
        kind: 'base',
        weight_grams: 500,
        quantity: 1,
        notes: '',
        sort_order: 1,
      },
    ])

    renderPage()

    await user.click(await screen.findByText('Tent'))
    const nameInput = screen.getByLabelText('編集名前')
    await user.clear(nameInput)
    await user.click(screen.getByText('Pack'))

    expect(screen.getByLabelText('編集名前')).toHaveValue('')
    expect(screen.getByText('名前は必須です。')).toBeInTheDocument()
  })

  it('focuses clicked cell field immediately', async () => {
    const user = userEvent.setup()
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
        notes: 'memo',
        sort_order: 0,
      },
    ])

    renderPage()

    await user.click(await screen.findByText('memo'))

    expect(screen.getByLabelText('編集メモ')).toHaveFocus()
  })
})
