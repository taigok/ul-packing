import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PackingList } from '@/lib/types'

export type ListFormValue = {
  title: string
  description: string
  template_id?: string
}

type Props = {
  isSubmitting: boolean
  templates: PackingList[]
  onSubmit: (values: ListFormValue) => Promise<void>
}

export function ListCreateForm({ isSubmitting, templates, onSubmit }: Props) {
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ListFormValue>({
    defaultValues: { title: '', description: '' },
  })

  const submit = async (values: ListFormValue) => {
    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      template_id: templateId,
    })
    reset()
    setTemplateId(undefined)
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-2">
        <Label htmlFor="template">テンプレート</Label>
        <Select value={templateId ?? 'none'} onValueChange={(value) => setTemplateId(value === 'none' ? undefined : value)}>
          <SelectTrigger id="template">
            <SelectValue placeholder="テンプレートを選択（任意）" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">選択しない</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title', { required: true, maxLength: 100 })} placeholder="Northern Alps 2 days" />
        {errors.title ? <p className="text-sm text-destructive">Title は必須です（最大100文字）。</p> : null}
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
