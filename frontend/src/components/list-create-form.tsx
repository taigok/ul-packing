import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type ListFormValue = {
  title: string
  description: string
}

type Props = {
  isSubmitting: boolean
  onSubmit: (values: ListFormValue) => Promise<void>
}

export function ListCreateForm({ isSubmitting, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ListFormValue>({
    defaultValues: { title: '', description: '' },
  })

  const submit = async (values: ListFormValue) => {
    await onSubmit({ title: values.title.trim(), description: values.description.trim() })
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Packing List</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title', { required: true, maxLength: 100 })} placeholder="Northern Alps 2 days" />
            {errors.title ? <p className="text-sm text-destructive">Title is required (max 100).</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description', { maxLength: 500 })} placeholder="Optional notes" />
            {errors.description ? <p className="text-sm text-destructive">Description is too long.</p> : null}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create List'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
