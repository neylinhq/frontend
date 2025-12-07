import { AIChatPanel } from './ai-chat-panel'

interface AISuggestionsPanelProps {
  nodeId: string
  mapId: string
}

export const AISuggestionsPanel = ({ nodeId, mapId }: AISuggestionsPanelProps) => {
  return (
    <div className='flex flex-col h-full w-full'>
      <AIChatPanel nodeId={nodeId} mapId={mapId} />
    </div>
  )
}
