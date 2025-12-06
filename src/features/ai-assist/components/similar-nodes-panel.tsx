import { ExternalLink, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { useSimilarNodes } from '@/entities/node/node.queries'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'

interface SimilarNodesPanelProps {
  mapId: string
  nodeId: string
  onNodeClick?: (nodeId: string) => void
}

export const SimilarNodesPanel = ({ mapId, nodeId, onNodeClick }: SimilarNodesPanelProps) => {
  const { data: similarResult, isLoading } = useSimilarNodes(mapId, nodeId, {
    limit: 5,
    threshold: 0.7
  })

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <div className='h-20 bg-muted animate-pulse rounded' />
        <div className='h-20 bg-muted animate-pulse rounded' />
        <div className='h-20 bg-muted animate-pulse rounded' />
      </div>
    )
  }

  const nodes = similarResult?.data?.nodes || []
  const similarities = similarResult?.data?.similarity || []

  if (nodes.length === 0) {
    return (
      <Card>
        <CardContent className='p-4 text-sm text-muted-foreground'>
          No similar nodes found. Generate embeddings to enable similarity search.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Sparkles className='w-4 h-4 text-primary' />
        <h4 className='text-sm font-medium'>Similar Nodes (RAG)</h4>
      </div>

      {nodes.map((node, idx) => {
        const similarity = similarities[idx] || 0
        const similarityPercent = Math.round(similarity * 100)

        return (
          <Card
            key={node.id}
            className='hover:border-primary/50 transition-colors cursor-pointer'
            onClick={() => onNodeClick?.(node.id)}
          >
            <CardHeader className='p-3'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0'>
                  <CardTitle className='text-sm truncate'>{node.label}</CardTitle>
                  {node.description && (
                    <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                      {node.description}
                    </p>
                  )}
                </div>
                <Badge variant='secondary' className='shrink-0 text-xs'>
                  {similarityPercent}%
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='p-3 pt-0'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {node.type}
                </Badge>
                <Link
                  to={`/maps/${mapId}?node=${node.id}`}
                  className='ml-auto text-xs text-primary hover:underline flex items-center gap-1'
                  onClick={e => e.stopPropagation()}
                >
                  View
                  <ExternalLink className='w-3 h-3' />
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
