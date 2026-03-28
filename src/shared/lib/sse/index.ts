export interface SSEChunk {
  type: string
  [key: string]: unknown
}

/**
 * Generic SSE stream reader.
 *
 * Reads a `Response` body as an SSE stream, parsing `data: ` prefixed JSON lines
 * and calling `onChunk` for each successfully parsed chunk.
 */
export async function parseSSEStream(
  response: Response,
  onChunk: (chunk: SSEChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  // If already aborted, release reader immediately
  if (signal?.aborted) {
    reader.cancel()
    return
  }

  // Wire up abort signal to cancel the reader
  const onAbort = () => reader.cancel()
  signal?.addEventListener('abort', onAbort)

  try {
    const decoder = new TextDecoder()
    let buffer = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const chunk = JSON.parse(line.slice(6)) as SSEChunk
          onChunk(chunk)
        } catch {
          // skip unparseable chunks
        }
      }
    }
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
}
