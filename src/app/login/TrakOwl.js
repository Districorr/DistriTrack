'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

const spring = { type: 'spring', stiffness: 200, damping: 20 }
const subtleSpring = { type: 'spring', stiffness: 150, damping: 30 }

// --- Variantes de Animación Detalladas ---

const bodyVariants = {
  idle: { y: [0, -3, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  loading: { scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
}

const headVariants = {
  idle: { rotate: 0, y: 0, transition: spring },
  lookEmail: { rotate: -2, y: 5, transition: spring },
  lookPassword: { rotate: 4, y: 0, transition: spring },
  error: { rotate: [0, -8, 8, -6, 6, 0], transition: { duration: 0.5, type: 'spring', stiffness: 300, damping: 15 } },
}

const eyelidVariants = {
  idle: { y: 0, scaleY: 1, transition: subtleSpring },
  blink: { y: [0, 18, 0], transition: { duration: 0.25, times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 4 } },
  squint: { y: 8, scaleY: 0.8, transition: subtleSpring },
  loading: { y: 18, transition: { duration: 0.3, ease: 'easeOut' } },
}

const pupilVariants = {
  idle: { x: 0, y: 0 },
  lookEmail: { x: -2, y: 4 },
  lookPassword: { x: 3, y: 0 },
}

const beakVariants = {
  idle: { y: 0, scaleY: 1, transition: spring },
  error: { y: 4, scaleY: 1.2, transition: { duration: 0.1, yoyo: 1, repeat: 1 } }
}

// --- NUEVAS VARIANTES PARA LAS ALAS ---
const leftWingVariants = {
  idle: { y: 0, rotate: 0, transition: spring },
  peeking: { y: -35, rotate: 15, transition: spring }, // Sube y rota para cubrir
}

const rightWingVariants = {
  idle: { y: 0, rotate: 0, transition: spring },
  peeking: { y: -30, rotate: -10, transition: spring }, // Sube un poco menos para el efecto de espiar
}

const rightPupilPeekVariants = {
  idle: { x: 0, transition: spring },
  peeking: { x: 5, transition: spring }, // La pupila se mueve para espiar
}

const shadowVariants = {
  idle: { scale: [1, 0.95, 1], opacity: [0.1, 0.05, 0.1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
}

export default function TrakOwl({ state, isPasswordVisible }) {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const pupilTranslateX = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 0], [-4, 4]);
  const pupilTranslateY = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 0], [-3, 3]);

  const headState = state === 'emailFocus' ? 'lookEmail' : state === 'passwordFocus' ? 'lookPassword' : state === 'error' ? 'error' : 'idle';
  const eyelidState = state === 'passwordFocus' ? 'squint' : state === 'loading' ? 'loading' : 'blink';
  const beakState = state === 'error' ? 'error' : 'idle';
  const wingState = isPasswordVisible ? 'peeking' : 'idle'; // El estado para las alas
  
  const arePupilsFollowingMouse = state === 'idle' || state === 'error';

  return (
    <div className="relative w-48 h-48 flex flex-col items-center justify-center">
      <motion.div
        className="w-full h-auto"
        initial="idle"
        animate={state === 'loading' ? 'loading' : 'idle'}
        variants={bodyVariants}
      >
        <motion.svg
          viewBox="0 0 200 150"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
        >
          <motion.g
            initial="idle"
            animate={headState}
            variants={headVariants}
          >
            {/* Cuerpo */}
            <path d="M100,10 C150,10 190,40 190,90 C190,140 150,140 100,140 C50,140 10,140 10,90 C10,40 50,10 100,10 Z" fill="#3B82F6" />
            <path d="M100,60 C140,60 160,80 160,110 L40,110 C40,80 60,60 100,60 Z" fill="#60A5FA" />
            
            {/* Ojos */}
            <circle cx="70" cy="75" r="20" fill="white" />
            <circle cx="130" cy="75" r="20" fill="white" />
            
            {/* Grupo de pupilas */}
            <motion.g
              style={{
                x: arePupilsFollowingMouse ? pupilTranslateX : 0,
                y: arePupilsFollowingMouse ? pupilTranslateY : 0,
              }}
              initial="idle"
              animate={state === 'emailFocus' ? 'lookEmail' : state === 'passwordFocus' ? 'lookPassword' : 'idle'}
              variants={pupilVariants}
              transition={subtleSpring}
            >
              <circle cx="70" cy="75" r="8" fill="#1E3A8A" />
              {/* Pupila derecha con animación de espiar independiente */}
              <motion.circle
                cx="130"
                cy="75"
                r="8"
                fill="#1E3A8A"
                initial="idle"
                animate={wingState}
                variants={rightPupilPeekVariants}
              />
            </motion.g>

            {/* Párpados (sin cambios, ya no hacen el guiño) */}
            <motion.path d="M50,55 a20,20 180 0,1 40,0" fill="#3B82F6" initial="idle" animate={eyelidState} variants={eyelidVariants} style={{ transformOrigin: "center 75px" }} />
            <motion.path d="M110,55 a20,20 180 0,1 40,0" fill="#3B82F6" initial="idle" animate={eyelidState} variants={eyelidVariants} style={{ transformOrigin: "center 75px" }} />

            {/* --- NUEVOS ELEMENTOS: LAS ALAS --- */}
            <motion.path
              d="M30,90 C10,120 40,140 60,110 Z"
              fill="#60A5FA"
              stroke="#3B82F6"
              strokeWidth="4"
              initial="idle"
              animate={wingState}
              variants={leftWingVariants}
              style={{ transformOrigin: "50px 100px" }}
            />
            <motion.path
              d="M170,90 C190,120 160,140 140,110 Z"
              fill="#60A5FA"
              stroke="#3B82F6"
              strokeWidth="4"
              initial="idle"
              animate={wingState}
              variants={rightWingVariants}
              style={{ transformOrigin: "150px 100px" }}
            />

            {/* Pico */}
            <motion.path d="M95,85 L105,85 L100,95 Z" fill="#FBBF24" initial="idle" animate={beakState} variants={beakVariants} style={{ transformOrigin: "center 85px" }} />
          </motion.g>
        </motion.svg>
      </motion.div>

      <motion.div
        className="w-2/3 h-2 bg-black rounded-full mt-2"
        initial="idle"
        animate="idle"
        variants={shadowVariants}
        style={{ filter: 'blur(5px)' }}
      />
    </div>
  )
}