/**
 * Пример использования: Как переключиться между xyflow и WebGL
 */

// ============================================================================
// СПОСОБ 1: Простая замена импорта (рекомендуется для постоянного переключения)
// ============================================================================

// ❌ Было (xyflow):
// import { GraphVisualization } from '@/features/graph';

// ✅ Стало (WebGL):
import { GraphVisualization } from '@/features/graph-webgl';

// Использование - БЕЗ ИЗМЕНЕНИЙ!
function MyPage() {
  return (
    <GraphVisualization
      mapId="map-id"
      interactive={true}
      className="h-full"
    />
  );
}

// ============================================================================
// СПОСОБ 2: Условное переключение через env (для A/B тестинга)
// ============================================================================

import { GraphVisualization as XyflowGraph } from '@/features/graph';
import { GraphVisualization as WebGLGraph } from '@/features/graph-webgl';

// В .env.local добавить:
// NEXT_PUBLIC_USE_WEBGL=true

const USE_WEBGL = process.env.NEXT_PUBLIC_USE_WEBGL === 'true';
const Graph = USE_WEBGL ? WebGLGraph : XyflowGraph;

function MyPageWithFlag() {
  return <Graph mapId="map-id" />;
}

// ============================================================================
// СПОСОБ 3: Динамическое переключение в UI (для тестирования)
// ============================================================================

import { useState } from 'react';
import { GraphVisualization as XyflowGraph } from '@/features/graph';
import { GraphVisualization as WebGLGraph } from '@/features/graph-webgl';
import { Button } from '@/shared/components/button';

function MyPageWithToggle() {
  const [useWebGL, setUseWebGL] = useState(false);
  const Graph = useWebGL ? WebGLGraph : XyflowGraph;

  return (
    <div>
      {/* Кнопка переключения */}
      <Button onClick={() => setUseWebGL(!useWebGL)}>
        Режим: {useWebGL ? 'WebGL' : 'xyflow'}
      </Button>

      {/* Граф - одинаковый API! */}
      <Graph mapId="map-id" className="h-full" />
    </div>
  );
}

// ============================================================================
// СПОСОБ 4: Автоматический выбор по размеру графа
// ============================================================================

import { GraphVisualization as XyflowGraph } from '@/features/graph';
import { GraphVisualization as WebGLGraph } from '@/features/graph-webgl';
import { useFullMap } from '@/entities/map';

function SmartGraphSelector({ mapId }: { mapId: string }) {
  const { data: map } = useFullMap(mapId);

  // WebGL эффективнее для больших графов (>100 узлов)
  const shouldUseWebGL = (map?.nodes.length ?? 0) > 100;
  const Graph = shouldUseWebGL ? WebGLGraph : XyflowGraph;

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">
        Engine: {shouldUseWebGL ? 'WebGL (оптимизировано для больших графов)' : 'xyflow'}
        {map && ` | ${map.nodes.length} узлов`}
      </div>
      <Graph mapId={mapId} />
    </div>
  );
}

// ============================================================================
// СПОСОБ 5: Комментирование строки (для быстрого переключения во время разработки)
// ============================================================================

// Закомментируйте одну из строк для переключения:
import { GraphVisualization } from '@/features/graph';        // xyflow
// import { GraphVisualization } from '@/features/graph-webgl';  // WebGL

function QuickSwitch() {
  return <GraphVisualization mapId="map-id" />;
}

export { MyPage, MyPageWithFlag, MyPageWithToggle, SmartGraphSelector, QuickSwitch };
