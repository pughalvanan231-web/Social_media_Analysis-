import React from 'react'

export default function BrandLogo({ size = 26, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform hover:scale-110 active:scale-95 ${className}`}
    >
      {/* Outer wings */}
      <path 
        d="M23.6 9.58L22.53 6.29A0.9 0.9 0 0 0 21.68 5.67A0.9 0.9 0 0 0 20.83 6.29L19.76 9.58H4.24L3.17 6.29A0.9 0.9 0 0 0 2.32 5.67A0.9 0.9 0 0 0 1.47 6.29L0.4 9.58A1.76 1.76 0 0 0 1.04 11.55L11.41 19.09A1.05 1.05 0 0 0 12.59 19.09L22.96 11.55A1.76 1.76 0 0 0 23.6 9.58Z" 
        fill="#E24329" 
      />
      {/* Center diamond & crown */}
      <path 
        d="M12 19.09L15.8 7.39H8.2L12 19.09Z" 
        fill="#FC6D26" 
      />
      {/* Left chevron flank */}
      <path 
        d="M12 19.09L8.2 7.39H4.24L12 19.09Z" 
        fill="#FCA326" 
      />
      {/* Right chevron flank */}
      <path 
        d="M12 19.09L15.8 7.39H19.76L12 19.09Z" 
        fill="#FCA326" 
      />
      {/* Left facet ear */}
      <path 
        d="M4.24 7.39L3.17 4.1A0.9 0.9 0 0 0 2.32 3.48A0.9 0.9 0 0 0 1.47 4.1L0.4 7.39H4.24Z" 
        fill="#E24329" 
      />
      {/* Left lower facet */}
      <path 
        d="M0.4 7.39L0 8.38A1.76 1.76 0 0 0 0.64 10.35L12 19.09L4.24 7.39Z" 
        fill="#FC6D26" 
      />
      {/* Right facet ear */}
      <path 
        d="M19.76 7.39L20.83 4.1A0.9 0.9 0 0 0 21.68 3.48A0.9 0.9 0 0 0 22.53 4.1L23.6 7.39H19.76Z" 
        fill="#E24329" 
      />
      {/* Right lower facet */}
      <path 
        d="M23.6 7.39L24 8.38A1.76 1.76 0 0 1 23.36 10.35L12 19.09L19.76 7.39Z" 
        fill="#FC6D26" 
      />
    </svg>
  )
}
