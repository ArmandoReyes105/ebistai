export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown
  ) {
    super(`API Error: ${status}: ${statusText}`)
    this.name = "ApiError"
  }

  // Machine-readable code from a ProblemDetails body (e.g. "stage_unchanged").
  get code(): string | undefined {
    const body = this.body as { code?: unknown } | null | undefined
    return typeof body?.code === "string" ? body.code : undefined
  }
}
