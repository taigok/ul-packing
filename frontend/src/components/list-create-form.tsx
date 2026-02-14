import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
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
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-2">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" {...register('title', { required: true, maxLength: 100 })} placeholder="北アルプス 2泊3日" />
        {errors.title ? <p className="text-sm text-destructive">タイトルは必須です（最大100文字）。</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">説明</Label>
        <Textarea id="description" {...register('description', { maxLength: 500 })} placeholder="任意メモ" />
        {errors.description ? <p className="text-sm text-destructive">説明が長すぎます。</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '作成中...' : 'リストを作成'}
      </Button>
    </form>
  )
}
