'use client';
import React, { useState, useEffect } from 'react';

interface EstuSpinnerProps {
  size?: 'md' | 'lg';
  text?: string;
  showPhrases?: boolean;
}

const PHRASES = [
  "Buscando tu próximo hogar...",
  "Preparando los exámenes...",
  "Calculando la distancia a la U...",
  "Asegurando que el Wi-Fi sea potente...",
  "Alistando la zona de estudio..."
];

const EstuSpinner: React.FC<EstuSpinnerProps> = ({ 
  size = 'md', 
  text, 
  showPhrases = false 
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!showPhrases) return;

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 3000); // Change phrase every 3 seconds

    return () => clearInterval(interval);
  }, [showPhrases]);

  const sizeClasses = {
    md: 'w-24 h-24', // 96px
    lg: 'w-40 h-40', // 160px
  };

  const displayText = showPhrases ? PHRASES[phraseIndex] : text;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* SVG Container */}
        <svg 
          viewBox="0 0 200 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Destellos / Sparkles (animados) */}
          <g className="animate-sparkle opacity-0 origin-center" style={{ animationDelay: '0.7s', transformOrigin: '100px 30px' }}>
            <path d="M100 10 L102 20 L112 22 L102 24 L100 34 L98 24 L88 22 L98 20 Z" fill="#fde047" />
            <path d="M70 30 L71 35 L76 36 L71 37 L70 42 L69 37 L64 36 L69 35 Z" fill="#fef08a" />
            <path d="M130 40 L131 43 L134 44 L131 45 L130 48 L129 45 L126 44 L129 43 Z" fill="#fef08a" />
          </g>

          {/* Cuerpo del estudiante (Color base stone-700) */}
          <g transform="translate(100, 150)">
            {/* Hombros/Torso */}
            <path 
              d="M-25 0 C-25 -20, 25 -20, 25 0 L35 50 L-35 50 Z" 
              fill="#44403c" 
            />
            {/* Cuello */}
            <rect x="-6" y="-30" width="12" height="15" fill="#fca5a5" />
            {/* Cabeza (sin birrete al inicio) */}
            <circle cx="0" cy="-45" r="18" fill="#fca5a5" />
            
            {/* Brazos (animados: se levantan solos) */}
            <g className="animate-raiseArms" style={{ transformOrigin: '0px -10px' }}>
              {/* Brazo izquierdo */}
              <path 
                d="M-22 -5 C-35 -5, -45 -15, -40 -30" 
                stroke="#44403c" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="none" 
              />
              {/* Brazo derecho */}
              <path 
                d="M22 -5 C35 -5, 45 -15, 40 -30" 
                stroke="#44403c" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="none" 
              />
              {/* Manos */}
              <circle cx="-40" cy="-30" r="5" fill="#fca5a5" />
              <circle cx="40" cy="-30" r="5" fill="#fca5a5" />
            </g>
          </g>

          {/* Birrete (animado: vuela hacia arriba y rota!) */}
          {/* Colores de la marca: Teal (0f766e) para destacar */}
          <g className="animate-throwCap" style={{ transformOrigin: '100px 105px' }}>
            {/* Base del birrete (gorro interior) */}
            <path 
              d="M85 102 C85 98, 115 98, 115 102 L110 115 C110 118, 90 118, 90 115 Z" 
              fill="#115e59" 
            />
            {/* Diamante superior */}
            <path d="M100 85 L135 100 L100 110 L65 100 Z" fill="#0f766e" />
            {/* Borla (tassel) colgando de un lado */}
            <path d="M100 97 C120 100, 130 110, 132 125" stroke="#fde047" strokeWidth="2" fill="none" />
            <circle cx="132" cy="125" r="2" fill="#eab308" />
            {/* Botón arriba */}
            <circle cx="100" cy="97" r="3" fill="#134e4a" />
          </g>
        </svg>
      </div>
      
      {/* Texto de carga animado */}
      {(text || showPhrases) && (
        <div className="mt-6 h-6 flex items-center justify-center overflow-hidden">
          <p 
            key={phraseIndex} 
            className={`font-semibold text-teal-700 ${showPhrases ? 'animate-textCycle' : 'animate-pulse'}`}
          >
            {displayText}
          </p>
        </div>
      )}
    </div>
  );
};

export default EstuSpinner;
