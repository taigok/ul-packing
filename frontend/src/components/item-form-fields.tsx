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
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name', { required: true, maxLength: 120 })} placeholder="Tent" />
        {errors.name ? <p className="text-sm text-destructive">Name is required.</p> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-3 md:gap-3">
        <div className="grid gap-2">
          <Label>Category</Label>
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
          <Label htmlFor="weight_grams">Weight (g)</Label>
          <Input id="weight_grams" type="number" min={1} {...register('weight_grams', { min: 1, required: true, valueAsNumber: true })} />
          {errors.weight_grams ? <p className="text-sm text-destructive">Weight must be {'>= 1'}.</p> : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quantity">Qty</Label>
          <Input id="quantity" type="number" min={1} {...register('quantity', { min: 1, required: true, valueAsNumber: true })} />
          {errors.quantity ? <p className="text-sm text-destructive">Quantity must be {'>= 1'}.</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Kind</Label>
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes', { maxLength: 2000 })} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
