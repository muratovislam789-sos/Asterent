import React from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  size?: number
  showValue?: boolean
  reviewCount?: number
}

export function StarRating({ value, size = 16, showValue = true, reviewCount }: StarRatingProps) {
  const rounded = Math.round(value)
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={i <= rounded ? 'fill-warning text-warning' : 'fill-gray-200 text-gray-200'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-700 font-medium ml-1">
          {value > 0 ? value.toFixed(1) : 'Нет оценок'}
          {reviewCount !== undefined && reviewCount > 0 && (
            <span className="text-text font-normal"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  )
}

interface StarPickerProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

export function StarPicker({ value, onChange, size = 28 }: StarPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            width={size}
            height={size}
            className={i <= value ? 'fill-warning text-warning' : 'fill-gray-200 text-gray-200'}
          />
        </button>
      ))}
    </div>
  )
}
