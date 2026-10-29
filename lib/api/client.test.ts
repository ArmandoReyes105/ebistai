import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "./client"
import { ApiError } from "./errors"

// The client reads the base URL when the module loads, so set it before the imports run.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.test.example/api/"
})

const okBlob = () =>
  new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]), {
    status: 200,
    headers: { "Content-Type": "application/octet-stream" },
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("apiClient.getBlob", () => {
  it("returns the body as a Blob without parsing it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okBlob())
    vi.stubGlobal("fetch", fetchMock)

    const blob = await apiClient.getBlob("export/applications")

    expect(blob).toBeInstanceOf(Blob)
    expect(new Uint8Array(await blob.arrayBuffer())).toEqual(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04])
    )
  })

  it("sends a GET with the bearer token and the query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okBlob())
    vi.stubGlobal("fetch", fetchMock)

    await apiClient.getBlob("export/applications", {
      token: "tok",
      params: { tz: "America/Mexico_City" },
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(new URL(url).pathname).toMatch(/export\/applications$/)
    expect(new URL(url).searchParams.get("tz")).toBe("America/Mexico_City")
    expect(init.method).toBe("GET")
    expect(init.headers.Authorization).toBe("Bearer tok")
  })

  it("throws an ApiError when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(null, { status: 401, statusText: "Unauthorized" })
        )
    )

    await expect(apiClient.getBlob("export/applications")).rejects.toEqual(
      new ApiError(401, "Unauthorized", undefined)
    )
  })
})

describe("apiClient.get", () => {
  it("still parses JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"a":1}', { status: 200 }))
    )

    await expect(apiClient.get<{ a: number }>("stats")).resolves.toEqual({
      a: 1,
    })
  })
})
