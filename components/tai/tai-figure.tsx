"use client"

import { useId, useState } from "react"
import { cn } from "cn"

import { createSnapshot } from "@/lib/tai/blend"
import type { SolidLayer } from "@/lib/tai/blend"
import { rgbToHex } from "@/lib/tai/color"
import { idleKindFor } from "@/lib/tai/idle"
import { poseViewBox } from "@/lib/tai/frame"
import { serializePath } from "@/lib/tai/path"
import { COLD_GRADIENT, POSE_OFFSETS, TAI_VIEW_BOX } from "@/lib/tai/poses"
import { SNOWFLAKES, snowflakePath } from "@/lib/tai/snow"
import { TAI_LAYERS } from "@/lib/tai/types"
import type { TaiLayer } from "@/lib/tai/types"

import styles from "./tai-figure.module.css"
import { useTaiMorph } from "./use-tai-morph"
import type { TaiIdle } from "./use-tai-morph"

// "sad" exists as data in lib/tai only; it is not part of the public API.
export type TaiPose = "neutral" | "sleep" | "cold"

interface TaiFigureProps {
  pose: TaiPose
  className?: string
  // Ink outline for red backgrounds; off for small, neutral-background uses.
  outlined?: boolean
  // Crops the canvas to the fish itself (no z's, no snowflakes); for icon
  // sizes such as the logo.
  tight?: boolean
  // Idle motion. true: full (swim, breathe, shiver, blink). "blink": calm,
  // random blinks only (logos). false: still.
  idle?: TaiIdle
  // Small renders: one larger snowflake instead of three (less noise).
  compact?: boolean
}

const INK = "#09090B"
const TIGHT_MARGIN = 3
const TIGHT_VIEW_BOX = poseViewBox("neutral", TIGHT_MARGIN)

// Layers that carry the ink outline: everything red (or recolored in cold),
// never the belly or the eyes.
const UNOUTLINED: readonly TaiLayer[] = ["panza", "leftEye", "rightEye"]

/**
 * The sleep z glyphs were drawn relative to the sleeping fish; keep that
 * relation in the shared frame, where sleep is translated by POSE_OFFSETS.
 */
const Z_SHIFT = [POSE_OFFSETS.sleep[0] + 3, POSE_OFFSETS.sleep[1] - 46] as const

/**
 * Tai, the mascot. Neutral, sleep and cold are morphed point by point in one
 * frame. `d`, `fill`, the gradient stops and the group transform are written
 * by the morph hook; the values below only seed the first paint, so a React
 * re-render can never overwrite a shape mid-morph.
 */
const TaiFigure = ({
  pose,
  className,
  outlined = true,
  tight = false,
  idle = true,
  compact = false,
}: TaiFigureProps) => {
  const uid = useId().replace(/:/g, "")
  const gradientId = `tai-frost-${uid}`
  const shadowId = `tai-fin-shadow-${uid}`
  const inked = (layer: TaiLayer) => outlined && !UNOUTLINED.includes(layer)
  const [seed] = useState(() => createSnapshot(pose))
  // Seeded once: afterwards the hook swaps data-idle while the idle is silent.
  const [initialIdle] = useState(() =>
    idle === true ? idleKindFor(pose) : "none"
  )
  const {
    svgBind,
    shiverBind,
    layerBind,
    stopBind,
    groupBind,
    zBind,
    flakesBind,
  } = useTaiMorph({ pose, idle })

  return (
    <svg
      ref={svgBind}
      className={cn("h-auto", styles.svg, className)}
      data-idle={initialIdle}
      data-outlined={outlined ? "" : undefined}
      viewBox={tight ? TIGHT_VIEW_BOX : TAI_VIEW_BOX}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={COLD_GRADIENT.x}
          y1={COLD_GRADIENT.y1}
          x2={COLD_GRADIENT.x}
          y2={COLD_GRADIENT.y2}
        >
          {([0, 1, 2] as const).map((i) => (
            <stop
              key={i}
              ref={stopBind(i)}
              offset={COLD_GRADIENT.offsets[i]}
              stopColor={rgbToHex(seed.colors[`body${i}` as const])}
            />
          ))}
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="170%">
          <feOffset dy="4" in="SourceAlpha" result="offset" />
          <feGaussianBlur in="offset" stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0"
            result="shadow"
          />
          <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
        </filter>
      </defs>
      <g ref={shiverBind} className={styles.shiver}>
        <g className={styles.root}>
          <g
            ref={groupBind}
            transform={`translate(${seed.offset[0]} ${seed.offset[1]})`}
          >
            {TAI_LAYERS.map((layer) => (
              <path
                key={layer}
                ref={layerBind(layer)}
                className={styles[layer]}
                d={serializePath(seed.shapes[layer])}
                fill={
                  layer === "body"
                    ? `url(#${gradientId})`
                    : rgbToHex(seed.colors[layer as SolidLayer])
                }
                filter={layer === "fin" ? `url(#${shadowId})` : undefined}
                stroke={inked(layer) ? INK : undefined}
                strokeWidth={inked(layer) ? 5 : undefined}
              />
            ))}
          </g>
        </g>
      </g>
      {!tight && (
        <>
          <g transform={`translate(${Z_SHIFT[0]} ${Z_SHIFT[1]})`}>
            <g ref={zBind}>
              <text
                className={styles.z}
                x="176"
                y="66"
                fontSize="20"
                fontWeight="700"
              >
                z
              </text>
              <text
                className={`${styles.z} ${styles.z2}`}
                x="190"
                y="46"
                fontSize="26"
                fontWeight="700"
              >
                Z
              </text>
              <text
                className={`${styles.z} ${styles.z3}`}
                x="204"
                y="22"
                fontSize="32"
                fontWeight="700"
              >
                Z
              </text>
            </g>
          </g>
          <g ref={flakesBind}>
            {(compact ? SNOWFLAKES.slice(0, 1) : SNOWFLAKES).map((flake) => (
              <g
                key={flake.x}
                transform={`translate(${flake.x} ${flake.y}) scale(${compact ? 1.6 : 1})`}
              >
                <g
                  className={styles.flake}
                  style={{ animationDelay: `${flake.delay}s` }}
                >
                  <path d={snowflakePath(flake.r)} />
                </g>
              </g>
            ))}
          </g>
        </>
      )}
    </svg>
  )
}

export default TaiFigure
