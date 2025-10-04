"use client"

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs'
      case 'md':
        return 'w-12 h-12 text-sm'
      case 'lg':
        return 'w-16 h-16 text-lg'
      case 'xl':
        return 'w-20 h-20 text-xl'
      default:
        return 'w-12 h-12 text-sm'
    }
  }

  const getBackgroundColor = (name: string) => {
    if (!name) return 'bg-gray-400'
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div 
      className={`
        ${getSizeClasses()} 
        ${getBackgroundColor(name)} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold 
        ${className}
      `}
    >
      {getInitials(name)}
    </div>
  )
}
