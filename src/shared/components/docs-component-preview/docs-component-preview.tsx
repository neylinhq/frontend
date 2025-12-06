import type * as React from 'react'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { cn } from '@/shared/lib/cn'
import styles from './docs-component-preview.module.css'

interface DocsComponentPreviewProps {
  children: React.ReactNode
  code: string
  language?: string
  className?: string
  previewClassName?: string
}

export const DocsComponentPreview = ({
  children,
  code,
  language = 'tsx',
  className,
  previewClassName
}: DocsComponentPreviewProps) => {
  return (
    <div className={cn('rounded-lg border', className)}>
      <Tabs defaultValue='preview'>
        <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0'>
          <TabsTrigger
            value='preview'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-2'
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value='code'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-brand data-[state=active]:bg-transparent px-4 py-2'
          >
            Code
          </TabsTrigger>
        </TabsList>
        <TabsContent value='preview' className='mt-0'>
          <div className={cn('p-10 min-h-[100px]', previewClassName)}>{children}</div>
        </TabsContent>
        <TabsContent value='code' className='mt-0'>
          <DocsCodeBlock code={code} language={language} embedded />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface DocsPreviewProps {
  children: React.ReactNode
  className?: string
}

/**
 * Simple preview container without tabs
 */
export const DocsPreview = ({ children, className }: DocsPreviewProps) => {
  return <div className={cn(styles.preview, className)}>{children}</div>
}
