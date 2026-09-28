import React from 'react'

export default function GeometricAvatar({ size = 32, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full shadow-md shadow-purple-950/50 select-none cursor-pointer hover:scale-105 transition-transform ${className}`}
    >
      <circle cx="40" cy="40" r="40" fill="#240e45" />
      <circle cx="40" cy="40" r="37" fill="#3b126e" />
      
      {/* Outer purple facets */}
      <polygon points="40,6 52,24 28,24" fill="#d8b4fe" />
      <polygon points="28,24 40,40 16,40" fill="#c084fc" />
      <polygon points="52,24 64,40 40,40" fill="#c084fc" />
      
      {/* Mosaic facets */}
      <rect x="22" y="22" width="12" height="12" fill="#e9d5ff" />
      <rect x="46" y="22" width="12" height="12" fill="#e9d5ff" />
      <rect x="22" y="46" width="12" height="12" fill="#e9d5ff" />
      <rect x="46" y="46" width="12" height="12" fill="#e9d5ff" />
      
      {/* Center diamond & cross */}
      <polygon points="40,24 56,40 40,56 24,40" fill="#f3e8ff" />
      <polygon points="40,30 50,40 40,50 30,40" fill="#7e22ce" />
      <rect x="36" y="36" width="8" height="8" fill="#ffffff" />
      
      {/* Lower facets */}
      <polygon points="28,56 40,40 52,56" fill="#c084fc" />
      <polygon points="40,56 52,74 28,74" fill="#d8b4fe" />
      <polygon points="12,40 24,28 24,52" fill="#a855f7" />
      <polygon points="68,40 56,28 56,52" fill="#a855f7" />
    </svg>
  )
}
