import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ListCreateForm } from '@/components/list-create-form'

describe('ListCreateForm', () => {
  it('submits valid values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<ListCreateForm isSubmitting={false} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Title'), 'Test list')
    await user.type(screen.getByLabelText('説明'), 'desc')
    await user.click(screen.getByRole('button', { name: 'リストを作成' }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Test list', description: 'desc' })
  })
})
