import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PackingList } from '@/lib/types'

export type ListFormValue = {
  title: string
  description: string
  template_list_id?: string
  is_template: boolean
}

type Props = {
  isSubmitting: boolean
  templateOptions: PackingList[]
  onSubmit: (values: ListFormValue) => Promise<void>
}

export function ListCreateForm({ isSubmitting, templateOptions, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ListFormValue>({
    defaultValues: { title: '', description: '', template_list_id: undefined, is_template: false },
  })

  const selectedTemplateId = watch('template_list_id')
  const isTemplate = watch('is_template')

  const submit = async (values: ListFormValue) => {
    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      template_list_id: values.template_list_id || undefined,
      is_template: values.is_template,
    })
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
      <div className="grid gap-2">
        <Label htmlFor="template-list">テンプレートから作成（任意）</Label>
        <Select value={selectedTemplateId ?? 'none'} onValueChange={(value) => setValue('template_list_id', value === 'none' ? undefined : value)}>
          <SelectTrigger id="template-list">
            <SelectValue placeholder="テンプレートを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">指定なし</SelectItem>
            {templateOptions.map((template) => (
              <SelectItem key={template.id} value={template.id}>{template.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="is-template" checked={isTemplate} onCheckedChange={(checked) => setValue('is_template', checked)} />
        <Label htmlFor="is-template">このリストをテンプレートとして保存</Label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '作成中...' : 'リストを作成'}
      </Button>
    </form>
  )
}
