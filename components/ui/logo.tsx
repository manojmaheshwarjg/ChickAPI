import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export const ChickAPILogo: React.FC<LogoProps> = ({ 
  size = 32, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Abstract Unibody Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        className="flex-shrink-0"
      >
        {/* Main abstract shape inspired by Apple design */}
        <path
          d="M16 2C18.5 2 21 3.5 22.5 6C24.5 9 24.5 13 22.5 16C21 18.5 18.5 20 16 20C13.5 20 11 18.5 9.5 16C7.5 13 7.5 9 9.5 6C11 3.5 13.5 2 16 2Z"
          fill="url(#abstractGradient)"
        />
        
        {/* Inner curve for depth */}
        <path
          d="M16 6C17.5 6 19 7 19.5 8.5C20.5 10.5 20.5 13.5 19.5 15.5C19 17 17.5 18 16 18C14.5 18 13 17 12.5 15.5C11.5 13.5 11.5 10.5 12.5 8.5C13 7 14.5 6 16 6Z"
          fill="url(#innerGradient)"
          opacity="0.8"
        />
        
        {/* Small accent dot */}
        <circle
          cx="19"
          cy="11"
          r="1.5"
          fill="url(#accentGradient)"
          opacity="0.9"
        />
        
        {/* Bottom connection indicator */}
        <rect
          x="14.5"
          y="20"
          width="3"
          height="8"
          rx="1.5"
          fill="url(#connectionGradient)"
          opacity="0.6"
        />
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="abstractGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f2937"/>
            <stop offset="100%" stopColor="#374151"/>
          </linearGradient>
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4b5563"/>
            <stop offset="100%" stopColor="#6b7280"/>
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9ca3af"/>
            <stop offset="100%" stopColor="#d1d5db"/>
          </linearGradient>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b7280"/>
            <stop offset="100%" stopColor="#9ca3af"/>
          </linearGradient>
        </defs>
      </svg>
      
      {/* Logo Text - Apple-inspired typography */}
      <span className="text-2xl font-semibold text-gray-900 tracking-tight">
        ChickAPI
      </span>
    </div>
  )
}

// Icon-only version for compact spaces
export const ChickAPIIcon: React.FC<Pick<LogoProps, 'size' | 'className'>> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
    >
      {/* Abstract unibody shape */}
      <path
        d="M16 2C18.5 2 21 3.5 22.5 6C24.5 9 24.5 13 22.5 16C21 18.5 18.5 20 16 20C13.5 20 11 18.5 9.5 16C7.5 13 7.5 9 9.5 6C11 3.5 13.5 2 16 2Z"
        fill="url(#iconGradient)"
      />
      
      {/* Inner curve */}
      <path
        d="M16 6C17.5 6 19 7 19.5 8.5C20.5 10.5 20.5 13.5 19.5 15.5C19 17 17.5 18 16 18C14.5 18 13 17 12.5 15.5C11.5 13.5 11.5 10.5 12.5 8.5C13 7 14.5 6 16 6Z"
        fill="url(#iconInnerGradient)"
        opacity="0.8"
      />
      
      {/* Accent dot */}
      <circle
        cx="19"
        cy="11"
        r="1.5"
        fill="url(#iconAccentGradient)"
        opacity="0.9"
      />
      
      {/* Connection indicator */}
      <rect
        x="14.5"
        y="20"
        width="3"
        height="8"
        rx="1.5"
        fill="url(#iconConnectionGradient)"
        opacity="0.6"
      />
      
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f2937"/>
          <stop offset="100%" stopColor="#374151"/>
        </linearGradient>
        <linearGradient id="iconInnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4b5563"/>
          <stop offset="100%" stopColor="#6b7280"/>
        </linearGradient>
        <linearGradient id="iconAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9ca3af"/>
          <stop offset="100%" stopColor="#d1d5db"/>
        </linearGradient>
        <linearGradient id="iconConnectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b7280"/>
          <stop offset="100%" stopColor="#9ca3af"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default ChickAPILogo