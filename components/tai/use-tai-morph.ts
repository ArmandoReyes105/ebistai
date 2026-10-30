import { useEffect, useRef, useState } from "react"
import type { RefCallback } from "react"

import {
  blendSnapshots,
  cloneSnapshot,
  colorProgress,
  createSnapshot,
} from "@/lib/tai/blend"
import type { SolidLayer, TaiSnapshot } from "@/lib/tai/blend"
import { rgbToHex } from "@/lib/tai/color"
import {
  BLINK_MS,
  DOUBLE_BLINK_GAP_MS,
  idleKindFor,
  nextBlink,
  nextShiver,
  shiverFrames,
} from "@/lib/tai/idle"
import type { IdleKind } from "@/lib/tai/idle"
import {
  DEFAULT_MORPH_MS,
  easeInOutCubic,
  loopAmplitude,
  zOpacity,
} from "@/lib/tai/motion"
import type { Easing } from "@/lib/tai/motion"
import { serializePath } from "@/lib/tai/path"
import { TAI_LAYERS } from "@/lib/tai/types"
import type { PoseId, TaiLayer } from "@/lib/tai/types"

/**
 * - `true`: every idle loop of the pose (float, wag, breathe, shiver...) plus
 *   the random one-shots (blink, shiver).
 * - `"blink"`: calm. Random blinks only; no continuous motion.
 * - `false`: fully still.
 */
export type TaiIdle = boolean | "blink"

/** CSS loops run only for full idle. */
const hasLoops = (idle: TaiIdle) => idle === true
/** Random one-shots: blinks for any non-false idle, shivers for full only. */
const hasBlinks = (idle: TaiIdle) => idle !== false

interface MorphState {
  current: TaiSnapshot
  layers: Partial<Record<TaiLayer, SVGPathElement | null>>
  stops: (SVGStopElement | null)[]
  group: SVGGElement | null
  z: SVGGElement | null
  flakes: SVGGElement | null
  svg: SVGSVGElement | null
  shiver: SVGGElement | null
  /** Idle amplitude from the morph (fades out and back in around a morph). */
  amp: number
  /** 0 or 1 with a short ramp: the loops on/off switch. */
  gain: number
  gainRaf: number
  idle: TaiIdle
  idleKind: IdleKind
  pose: PoseId
  moving: boolean
  zOpacity: number
  flakeOpacity: number
  raf: number
  bindLayer: Record<TaiLayer, RefCallback<SVGPathElement>>
  bindStop: RefCallback<SVGStopElement>[]
  bindGroup: RefCallback<SVGGElement>
  bindZ: RefCallback<SVGGElement>
  bindFlakes: RefCallback<SVGGElement>
  bindSvg: RefCallback<SVGSVGElement>
  bindShiver: RefCallback<SVGGElement>
}

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

function applyAmp(state: MorphState) {
  state.svg?.style.setProperty("--amp", String(state.amp * state.gain))
}

/** Which CSS loop set is active: the pose's, or none when loops are off. */
function applyIdleKind(state: MorphState) {
  state.svg?.setAttribute(
    "data-idle",
    hasLoops(state.idle) ? state.idleKind : "none"
  )
}

function createState(pose: PoseId, idle: TaiIdle): MorphState {
  const state = {
    current: createSnapshot(pose),
    layers: {},
    stops: [null, null, null],
    group: null,
    z: null,
    flakes: null,
    svg: null,
    shiver: null,
    amp: 1,
    gain: hasLoops(idle) ? 1 : 0,
    gainRaf: 0,
    idle,
    idleKind: idleKindFor(pose),
    pose,
    moving: false,
    zOpacity: pose === "sleep" ? 1 : 0,
    flakeOpacity: pose === "cold" ? 1 : 0,
    raf: 0,
  } as MorphState
  state.bindLayer = Object.fromEntries(
    TAI_LAYERS.map((layer) => [
      layer,
      (el: SVGPathElement | null) => void (state.layers[layer] = el),
    ])
  ) as Record<TaiLayer, RefCallback<SVGPathElement>>
  state.bindStop = [0, 1, 2].map(
    (i) => (el: SVGStopElement | null) => void (state.stops[i] = el)
  )
  state.bindGroup = (el) => void (state.group = el)
  state.bindZ = (el) => {
    state.z = el
    if (el) el.style.opacity = String(state.zOpacity)
  }
  state.bindFlakes = (el) => {
    state.flakes = el
    if (el) el.style.opacity = String(state.flakeOpacity)
  }
  state.bindSvg = (el) => {
    state.svg = el
    if (el) applyAmp(state)
  }
  state.bindShiver = (el) => void (state.shiver = el)
  return state
}

/** Writes the snapshot straight to the DOM; React never touches these attrs. */
function paint(state: MorphState) {
  const { current } = state
  for (const layer of TAI_LAYERS) {
    const el = state.layers[layer]
    if (!el) continue
    el.setAttribute("d", serializePath(current.shapes[layer]))
    if (layer !== "body") {
      el.setAttribute("fill", rgbToHex(current.colors[layer as SolidLayer]))
    }
  }
  state.group?.setAttribute(
    "transform",
    `translate(${current.offset[0]} ${current.offset[1]})`
  )
  state.stops[0]?.setAttribute("stop-color", rgbToHex(current.colors.body0))
  state.stops[1]?.setAttribute("stop-color", rgbToHex(current.colors.body1))
  state.stops[2]?.setAttribute("stop-color", rgbToHex(current.colors.body2))
}

interface MorphOptions {
  durationMs: number
  easing: Easing
}

function startMorph(
  state: MorphState,
  pose: PoseId,
  { durationMs, easing }: MorphOptions
): (() => void) | undefined {
  if (state.pose === pose && !state.moving) return undefined
  state.pose = pose
  state.moving = true

  const reduced = reducedMotion()
  const duration = reduced ? 0 : Math.max(0, durationMs)
  // Retarget from wherever the shape is right now: no snap.
  const from = cloneSnapshot(state.current)
  const to = createSnapshot(pose)
  const towardCold = pose === "cold"
  const zFrom = state.zOpacity
  const zDirection = pose === "sleep" ? "sleep" : "wake"
  const flakeFrom = state.flakeOpacity
  const flakeDirection = pose === "cold" ? "sleep" : "wake"
  const ampStart = state.amp
  let swapped = false
  let t0 = -1

  const finish = () => {
    state.amp = 1
    state.idleKind = idleKindFor(pose)
    applyIdleKind(state)
    applyAmp(state)
    state.current = to
    state.zOpacity = pose === "sleep" ? 1 : 0
    state.flakeOpacity = pose === "cold" ? 1 : 0
    if (state.flakes) state.flakes.style.opacity = String(state.flakeOpacity)
    paint(state)
    if (state.z) state.z.style.opacity = String(state.zOpacity)
    state.moving = false
  }

  if (duration === 0) {
    finish()
    return undefined
  }

  const frame = (now: number) => {
    if (t0 < 0) t0 = now
    const t = Math.min(1, (now - t0) / duration)
    if (t >= 1) {
      finish()
      return
    }
    blendSnapshots(
      from,
      to,
      easing(t),
      colorProgress(towardCold, t),
      state.current
    )
    paint(state)
    // Idle loops fade out, swap while silent (t = 0.5), then fade back in.
    state.amp = loopAmplitude(t, ampStart)
    if (!swapped && t >= 0.5) {
      swapped = true
      state.idleKind = idleKindFor(pose)
      applyIdleKind(state)
    }
    applyAmp(state)
    state.zOpacity = zOpacity(zDirection, t, zFrom)
    if (state.z) state.z.style.opacity = String(state.zOpacity)
    // Same lifecycle as the z glyphs: late fade-in, early fade-out.
    state.flakeOpacity = zOpacity(flakeDirection, t, flakeFrom)
    if (state.flakes) state.flakes.style.opacity = String(state.flakeOpacity)
    state.raf = requestAnimationFrame(frame)
  }
  state.raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(state.raf)
}

/** Applies a new idle mode, easing the loops in or out. */
function rampGain(state: MorphState, idle: TaiIdle): () => void {
  state.idle = idle
  const loops = hasLoops(idle)
  const from = state.gain
  const to = loops ? 1 : 0
  if (from === to) {
    applyIdleKind(state)
    return () => {}
  }
  // Switching the loop set on right away; the gain ramp hides the start.
  applyIdleKind(state)
  let t0 = -1
  const frame = (now: number) => {
    if (t0 < 0) t0 = now
    const t = Math.min(1, (now - t0) / 300)
    state.gain = from + (to - from) * t
    applyAmp(state)
    if (t < 1) state.gainRaf = requestAnimationFrame(frame)
  }
  state.gainRaf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(state.gainRaf)
}

/** Randomly timed one-shots (blink, shiver) that CSS loops cannot express. */
function startIdleBursts(state: MorphState): () => void {
  let timer = 0
  let extra = 0
  const live = () =>
    !state.moving &&
    hasBlinks(state.idle) &&
    state.amp > 0.9 &&
    !reducedMotion()

  const blink = () => {
    for (const layer of ["leftEye", "rightEye"] as const) {
      state.layers[layer]?.animate(
        [
          { transform: "scaleY(1)" },
          { transform: "scaleY(0.1)", offset: 0.45 },
          { transform: "scaleY(1)" },
        ],
        { duration: BLINK_MS, easing: "ease-in-out" }
      )
    }
  }

  const shiver = (durationMs: number) => {
    const frames = shiverFrames(1.6)
    state.shiver?.animate(
      frames.map((f) => ({
        transform: `translateX(${f.x}px) rotate(${f.rotate}deg)`,
      })),
      { duration: durationMs, easing: "linear" }
    )
  }

  const loop = () => {
    if (state.idleKind === "cold") {
      const plan = nextShiver()
      timer = window.setTimeout(() => {
        // Shivers are motion beyond blinking: full idle only.
        if (live() && state.idle === true && state.idleKind === "cold") {
          shiver(plan.durationMs)
        }
        loop()
      }, plan.delayMs)
    } else {
      const plan = nextBlink()
      timer = window.setTimeout(() => {
        if (live() && state.idleKind === "neutral") {
          blink()
          if (plan.double) {
            extra = window.setTimeout(blink, BLINK_MS + DOUBLE_BLINK_GAP_MS)
          }
        }
        loop()
      }, plan.delayMs)
    }
  }
  loop()
  return () => {
    window.clearTimeout(timer)
    window.clearTimeout(extra)
  }
}

interface Options {
  pose: PoseId
  idle: TaiIdle
  durationMs?: number
  easing?: Easing
}

export function useTaiMorph({
  pose,
  idle,
  durationMs = DEFAULT_MORPH_MS,
  easing = easeInOutCubic,
}: Options) {
  const [state] = useState(() => createState(pose, idle))
  const options = useRef<MorphOptions>({ durationMs, easing })
  useEffect(() => {
    options.current = { durationMs, easing }
  })
  useEffect(() => startMorph(state, pose, options.current), [pose, state])
  // Loops on/off: ramp the gain so the motion eases in and out.
  useEffect(() => rampGain(state, idle), [idle, state])
  useEffect(() => startIdleBursts(state), [state])
  return {
    svgBind: state.bindSvg,
    shiverBind: state.bindShiver,
    layerBind: (layer: TaiLayer) => state.bindLayer[layer],
    stopBind: (index: 0 | 1 | 2) => state.bindStop[index],
    groupBind: state.bindGroup,
    zBind: state.bindZ,
    flakesBind: state.bindFlakes,
  }
}
