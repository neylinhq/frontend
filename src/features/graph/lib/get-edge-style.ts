import { getEdgeStrokeColor, type RelationType } from '@/entities/edge'

export const getEdgeStrokeByType = (relationType: RelationType) => {
  return getEdgeStrokeColor(relationType)
}

export const getEdgeStroke = (confidence: number) => {
  // Высокая уверенность - синий, низкая - серый
  return confidence > 0.7 ? '#3b82f6' : '#94a3b8' // blue-500 : slate-400
}

export const getEdgeWidth = (strength: number) => {
  // Сила связи влияет на толщину линии
  return strength * 2 + 1
}

export const getEdgeDashArray = (confidence?: number) => {
  // Пунктир только при явно низкой уверенности (< 0.5)
  // Если confidence не указан - сплошная линия (дефолт = высокая уверенность)
  if (confidence === undefined || confidence === null) {
    return undefined
  }
  return confidence < 0.5 ? '5,5' : undefined
}

export const getEdgeOpacity = (isSelected: boolean) => {
  return isSelected ? 1 : 0.7
}
