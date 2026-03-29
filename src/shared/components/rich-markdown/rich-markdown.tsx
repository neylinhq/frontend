import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import type { ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import githubDark from 'shiki/themes/github-dark.mjs'

import 'katex/dist/katex.min.css'

const highlighter = createHighlighterCoreSync({
  themes: [githubDark],
  langs: [],
  engine: createJavaScriptRegexEngine(),
})

/**
 * Convert LaTeX-style delimiters \(...\) and \[...\] to $...$ and $$...$$
 * that remark-math understands. Many AI models output LaTeX delimiters.
 */
function normalizeLatexDelimiters(text: string): string {
  return text
    .replace(/\\\[(.+?)\\\]/gs, (_match, inner: string) => `$$${inner}$$`)
    .replace(/\\\((.+?)\\\)/gs, (_match, inner: string) => `$${inner}$`)
}

type MarkdownProps = ComponentPropsWithoutRef<typeof Markdown>

interface RichMarkdownProps {
  children: string
  remarkPlugins?: MarkdownProps['remarkPlugins']
  rehypePlugins?: MarkdownProps['rehypePlugins']
  components?: MarkdownProps['components']
}

export function RichMarkdown({
  children,
  remarkPlugins,
  rehypePlugins,
  components
}: RichMarkdownProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath, ...(remarkPlugins ?? [])]}
      rehypePlugins={[
        rehypeKatex,
        rehypeRaw,
        [rehypeShikiFromHighlighter, highlighter, { theme: 'github-dark' }],
        ...(rehypePlugins ?? [])
      ]}
      components={components}
    >
      {normalizeLatexDelimiters(children)}
    </Markdown>
  )
}

export function InlineRichMarkdown({ children }: { children: string }) {
  return (
    <RichMarkdown
      components={{
        p: ({ children }) => <span>{children}</span>
      }}
    >
      {children}
    </RichMarkdown>
  )
}
