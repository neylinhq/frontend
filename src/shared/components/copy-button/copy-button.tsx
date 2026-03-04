import { CheckIcon, Copy01Icon } from '@untitledui/icons-react/outline'

import { Button, type ButtonProps } from '@/shared/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'
import { useCopyToClipboard } from '@/shared/lib/use-copy-to-clipboard'

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string
  label?: string
  copiedLabel?: string
  iconOnly?: boolean
  iconSize?: number
}

export const CopyButton = ({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  iconOnly = true,
  iconSize = 14,
  className,
  variant = 'ghost',
  size = 'icon',
  ...props
}: CopyButtonProps) => {
  const { copied, copy } = useCopyToClipboard()

  const iconStyle = { width: iconSize, height: iconSize }

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn(copied && 'text-success', className)}
            onClick={() => copy(value)}
            aria-label={copied ? copiedLabel : label}
            {...props}
          >
            {copied ? <CheckIcon style={iconStyle} /> : <Copy01Icon style={iconStyle} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <p className='text-xs'>{copied ? copiedLabel : label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(copied && 'text-success', className)}
      onClick={() => copy(value)}
      {...props}
    >
      {copied ? <CheckIcon style={iconStyle} /> : <Copy01Icon style={iconStyle} />}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  )
}
