/**
 * Closed absolute paths made of one M, any number of C and a final Z.
 * Interpolation is point by point, so two paths can only morph when they
 * share the same command signature (see `commandSignature`).
 */
export type PathShape = readonly number[]

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const TOKEN = /[MCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi

function tokenize(d: string): string[] {
  const tokens = d.match(TOKEN)
  if (!tokens || tokens[0].toUpperCase() !== "M") {
    throw new Error(`Unsupported path: ${d}`)
  }
  return tokens
}

export function parsePath(d: string): number[] {
  const tokens = tokenize(d)
  const out: number[] = []
  let i = 1
  out.push(Number(tokens[i++]), Number(tokens[i++]))
  while (i < tokens.length && tokens[i].toUpperCase() === "C") {
    i++
    for (let n = 0; n < 6; n++) out.push(Number(tokens[i++]))
  }
  const closed = tokens[i]?.toUpperCase() === "Z" && i === tokens.length - 1
  if (!closed || out.some(Number.isNaN)) {
    throw new Error(`Unsupported path: ${d}`)
  }
  return out
}

/** The command letters only, e.g. "MCCCZ". */
export function commandSignature(d: string): string {
  return tokenize(d)
    .filter((token) => /^[A-Za-z]$/.test(token))
    .join("")
    .toUpperCase()
}

export function serializePath(shape: PathShape): string {
  const f = (v: number) => String(Math.round(v * 100) / 100)
  let d = `M${f(shape[0])} ${f(shape[1])}`
  for (let i = 2; i < shape.length; i += 6) {
    d += `C${f(shape[i])} ${f(shape[i + 1])} ${f(shape[i + 2])} ${f(shape[i + 3])} ${f(shape[i + 4])} ${f(shape[i + 5])}`
  }
  return `${d}Z`
}

export function lerpShape(
  from: PathShape,
  to: PathShape,
  t: number,
  out?: number[]
): number[] {
  const result = out ?? new Array<number>(from.length)
  for (let i = 0; i < from.length; i++) {
    result[i] = t === 1 ? to[i] : from[i] + (to[i] - from[i]) * t
  }
  return result
}

function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number) {
  const u = 1 - t
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  )
}

/** Parameters in (0, 1) where the cubic's derivative is zero on one axis. */
function extremaParams(p0: number, p1: number, p2: number, p3: number) {
  const a = -p0 + 3 * p1 - 3 * p2 + p3
  const b = 2 * (p0 - 2 * p1 + p2)
  const c = p1 - p0
  const roots: number[] = []
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) roots.push(-c / b)
  } else {
    const disc = b * b - 4 * a * c
    if (disc >= 0) {
      const sqrt = Math.sqrt(disc)
      roots.push((-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a))
    }
  }
  return roots.filter((t) => t > 0 && t < 1)
}

/** Exact bounds of the drawn curve (on-curve extrema, not control points). */
export function pathBounds(shape: PathShape): Bounds {
  const bounds: Bounds = {
    minX: shape[0],
    maxX: shape[0],
    minY: shape[1],
    maxY: shape[1],
  }
  let x0 = shape[0]
  let y0 = shape[1]
  for (let i = 2; i < shape.length; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = shape.slice(i, i + 6)
    const xs = [
      x3,
      ...extremaParams(x0, x1, x2, x3).map((t) => cubicAt(x0, x1, x2, x3, t)),
    ]
    const ys = [
      y3,
      ...extremaParams(y0, y1, y2, y3).map((t) => cubicAt(y0, y1, y2, y3, t)),
    ]
    for (const x of xs) {
      bounds.minX = Math.min(bounds.minX, x)
      bounds.maxX = Math.max(bounds.maxX, x)
    }
    for (const y of ys) {
      bounds.minY = Math.min(bounds.minY, y)
      bounds.maxY = Math.max(bounds.maxY, y)
    }
    x0 = x3
    y0 = y3
  }
  return bounds
}

/** De Casteljau split of cubic segment `index` at t = 0.5. Lossless. */
export function splitSegment(shape: PathShape, index: number): number[] {
  const at = 2 + index * 6
  const [x0, y0] =
    index === 0 ? [shape[0], shape[1]] : [shape[at - 2], shape[at - 1]]
  const [x1, y1, x2, y2, x3, y3] = shape.slice(at, at + 6)
  const mid = (a: number, b: number) => (a + b) / 2
  const [ax, ay] = [mid(x0, x1), mid(y0, y1)]
  const [bx, by] = [mid(x1, x2), mid(y1, y2)]
  const [cx, cy] = [mid(x2, x3), mid(y2, y3)]
  const [dx, dy] = [mid(ax, bx), mid(ay, by)]
  const [ex, ey] = [mid(bx, cx), mid(by, cy)]
  const [mx, my] = [mid(dx, ex), mid(dy, ey)]
  return [
    ...shape.slice(0, at),
    ax,
    ay,
    dx,
    dy,
    mx,
    my,
    ex,
    ey,
    cx,
    cy,
    x3,
    y3,
    ...shape.slice(at + 6),
  ]
}

function anchorDistance(
  a: PathShape,
  b: PathShape,
  shift: readonly [number, number]
) {
  let total = 0
  for (let i = 0; i < a.length; i += i === 0 ? 2 : 6) {
    const k = i === 0 ? 0 : i + 4
    const ax = a[k] + shift[0]
    const ay = a[k + 1] + shift[1]
    total += (ax - b[k]) ** 2 + (ay - b[k + 1]) ** 2
  }
  return total
}

/**
 * Subdivide `shape` (lossless, at t = 0.5) until it has as many segments as
 * `reference`, choosing the splits whose anchors land closest to the
 * reference anchors. `shift` translates `shape` into the reference frame
 * for scoring only; the returned points stay in the shape's own frame.
 */
export function matchSegments(
  shape: PathShape,
  reference: PathShape,
  shift: readonly [number, number] = [0, 0]
): number[] {
  if (shape.length > reference.length) {
    throw new Error("Cannot reduce segments: shape has more than the reference")
  }
  if (shape.length === reference.length) return [...shape]
  let best: { shape: number[]; score: number } | undefined
  for (let index = 0; index < (shape.length - 2) / 6; index++) {
    const candidate = matchSegments(
      splitSegment(shape, index),
      reference,
      shift
    )
    const score = anchorDistance(candidate, reference, shift)
    if (!best || score < best.score) best = { shape: candidate, score }
  }
  return best!.shape
}
