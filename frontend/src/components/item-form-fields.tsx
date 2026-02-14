import { Controller, useForm } from 'react-hook-form'

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
import { categoryOptions, itemKindOptions } from '@/lib/constants'
import type { Category, GearItem, ItemKind } from '@/lib/types'

export type ItemFormValue = {
  name: string
  category: Category
  weight_grams: number
  quantity: number
  kind: ItemKind
  notes: string
}

type Props = {
  submitLabel: string
  defaultValue?: GearItem
  isSubmitting: boolean
  onSubmit: (values: ItemFormValue) => Promise<void>
}

export function ItemFormFields({ defaultValue, isSubmitting, submitLabel, onSubmit }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormValue>({
    defaultValues: {
      name: defaultValue?.name ?? '',
      category: defaultValue?.category ?? 'other',
      weight_grams: defaultValue?.weight_grams ?? 1,
      quantity: defaultValue?.quantity ?? 1,
      kind: defaultValue?.kind ?? 'base',
      notes: defaultValue?.notes ?? '',
    },
  })

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          name: values.name.trim(),
          notes: values.notes.trim(),
          weight_grams: Number(values.weight_grams),
          quantity: Number(values.quantity),
        })
      })}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">名前</Label>
        <Input id="name" {...register('name', { required: true, maxLength: 120 })} placeholder="テント" />
        {errors.name ? <p className="text-sm text-destructive">名前は必須です。</p> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-3 md:gap-3">
        <div className="grid gap-2">
          <Label>カテゴリ</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight_grams">重量 (g)</Label>
          <Input id="weight_grams" type="number" min={1} {...register('weight_grams', { min: 1, required: true, valueAsNumber: true })} />
          {errors.weight_grams ? <p className="text-sm text-destructive">重量は1以上で入力してください。</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">個数</Label>
          <Input id="quantity" type="number" min={1} {...register('quantity', { min: 1, required: true, valueAsNumber: true })} />
          {errors.quantity ? <p className="text-sm text-destructive">個数は1以上で入力してください。</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>種別</Label>
        <Controller
          name="kind"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemKindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">メモ</Label>
        <Textarea id="notes" {...register('notes', { maxLength: 2000 })} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
