import { NodeChatWrapper } from './node-chat-wrapper'

interface AISuggestionsPanelProps {
  nodeId: string
  mapId: string
}

export const AISuggestionsPanel = ({ nodeId, mapId }: AISuggestionsPanelProps) => {
  return (
    <div className='flex flex-col h-full w-full'>
      <NodeChatWrapper nodeId={nodeId} mapId={mapId} />
    </div>
  )
}
