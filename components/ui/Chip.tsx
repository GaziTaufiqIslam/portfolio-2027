import { cn } from '@/lib/utils'

export type ChipSize = 'large' | 'small'

interface ChipProps {
  label: string
  size?: ChipSize
  className?: string
}

export function Chip({ label, size = 'small', className }: ChipProps) {
  const isLarge = size === 'large'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 rounded-lg border border-solid whitespace-nowrap',
        isLarge
          ? // Large — primary, 16px, Text Pro 55 Roman, tracking -0.16px
            'bg-[var(--color-primary-100)] border-[var(--color-primary-500)] text-[var(--color-primary-500)]'
          : // Small — accent, 14px, Text Pro 65 Medium, tracking 0
            'bg-[var(--color-accent-100)] border-[var(--color-accent-200)] text-[var(--color-accent-700)]',
        className
      )}
      style={
        isLarge
          ? { fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '16px', lineHeight: 1.4, letterSpacing: '-0.16px' }
          : { fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '14px', lineHeight: 1.4, letterSpacing: '0' }
      }
    >
      {label}
    </span>
  )
}
