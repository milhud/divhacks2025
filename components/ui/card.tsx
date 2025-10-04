import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}