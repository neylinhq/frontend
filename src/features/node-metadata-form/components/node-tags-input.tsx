import { X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface NodeTagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export const NodeTagsInput = ({ value, onChange }: NodeTagsInputProps) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')

  const handleAddTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInputValue('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className='space-y-3'>
      <Label htmlFor='tags'>{t('form.tags.label')}</Label>
      <div className='flex gap-2'>
        <Input
          id='tags'
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('form.tags.placeholder')}
        />
        <Button type='button' onClick={handleAddTag} variant='secondary' size='sm'>
          {t('form.tags.add')}
        </Button>
      </div>
      {value.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {value.map(tag => (
            <Badge key={tag} variant='secondary' className='gap-1'>
              {tag}
              <button
                type='button'
                onClick={() => handleRemoveTag(tag)}
                className='ml-1 rounded-full hover:bg-muted'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
