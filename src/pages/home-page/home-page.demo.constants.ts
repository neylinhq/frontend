import type { FullMap } from '@/entities/map'

const MAP_ID = 'demo-cognitive-science'
const NOW = '2026-01-15T12:00:00Z'

const node = (
  id: string,
  label: string,
  type: 'concept' | 'theory' | 'fact' | 'person',
  x: number,
  y: number,
  description?: string
) => ({
  id,
  mapId: MAP_ID,
  label,
  description,
  type,
  position: { x, y },
  metadata: {},
  complexity: null,
  createdAt: NOW,
  updatedAt: NOW
})

const edge = (
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType:
    | 'prerequisite'
    | 'explains'
    | 'causes'
    | 'part-of'
    | 'related-to'
    | 'influences'
    | 'is-a'
    | 'similar-to',
  label?: string
) => ({
  id,
  mapId: MAP_ID,
  sourceNodeId,
  targetNodeId,
  relationType,
  label,
  strength: 0.7,
  bidirectional: false,
  metadata: { confidence: 0.8, createdBy: 'user' as const },
  createdAt: NOW,
  updatedAt: NOW
})

// Node IDs
const COGNITIVE_SCIENCE = 'a1b2c3d4-e5f6-7890-abcd-100000000001'
const MEMORY = 'a1b2c3d4-e5f6-7890-abcd-100000000002'
const WORKING_MEMORY = 'a1b2c3d4-e5f6-7890-abcd-100000000003'
const LONG_TERM_MEMORY = 'a1b2c3d4-e5f6-7890-abcd-100000000004'
const SPACED_REPETITION = 'a1b2c3d4-e5f6-7890-abcd-100000000005'
const FORGETTING_CURVE = 'a1b2c3d4-e5f6-7890-abcd-100000000006'
const EBBINGHAUS = 'a1b2c3d4-e5f6-7890-abcd-100000000007'
const ATTENTION = 'a1b2c3d4-e5f6-7890-abcd-100000000008'
const COGNITIVE_LOAD = 'a1b2c3d4-e5f6-7890-abcd-100000000009'
const SCHEMA_THEORY = 'a1b2c3d4-e5f6-7890-abcd-100000000010'
const PIAGET = 'a1b2c3d4-e5f6-7890-abcd-100000000011'
const METACOGNITION = 'a1b2c3d4-e5f6-7890-abcd-100000000012'
const TRANSFER = 'a1b2c3d4-e5f6-7890-abcd-100000000013'
const RETRIEVAL_PRACTICE = 'a1b2c3d4-e5f6-7890-abcd-100000000014'
const INTERLEAVING = 'a1b2c3d4-e5f6-7890-abcd-100000000015'
const ZPD = 'a1b2c3d4-e5f6-7890-abcd-100000000016'
const VYGOTSKY = 'a1b2c3d4-e5f6-7890-abcd-100000000017'
const CHUNKING = 'a1b2c3d4-e5f6-7890-abcd-100000000018'

export const DEMO_MAP: FullMap = {
  id: MAP_ID,
  title: 'How Learning Works',
  description: 'A cognitive science map exploring the mechanisms behind effective learning',
  createdAt: NOW,
  updatedAt: NOW,
  nodesCount: 18,
  edgesCount: 22,
  isPublic: true,

  nodes: [
    // Center hub
    node(COGNITIVE_SCIENCE, 'Cognitive Science', 'concept', 580, 280, 'The interdisciplinary study of the mind and its processes'),

    // Memory cluster (left)
    node(MEMORY, 'Memory', 'concept', 250, 200, 'The faculty of encoding, storing, and retrieving information'),
    node(WORKING_MEMORY, 'Working Memory', 'concept', 80, 100, 'Limited-capacity system for temporary information storage and manipulation'),
    node(LONG_TERM_MEMORY, 'Long-Term Memory', 'concept', 80, 320, 'Virtually unlimited store for knowledge and past events'),
    node(CHUNKING, 'Chunking', 'fact', 30, 210, 'Grouping individual pieces of information into larger meaningful units'),

    // Forgetting & Repetition cluster (bottom-left)
    node(FORGETTING_CURVE, 'Forgetting Curve', 'theory', 320, 460, 'Memory retention decays exponentially without reinforcement'),
    node(SPACED_REPETITION, 'Spaced Repetition', 'concept', 130, 470, 'Reviewing material at increasing intervals to optimize retention'),
    node(EBBINGHAUS, 'Hermann Ebbinghaus', 'person', 250, 560, 'Pioneer of memory research who discovered the forgetting curve'),

    // Attention & Load (top-right)
    node(ATTENTION, 'Attention', 'concept', 830, 120, 'Selective concentration on relevant information while ignoring distractions'),
    node(COGNITIVE_LOAD, 'Cognitive Load Theory', 'theory', 1020, 200, 'Instructional design must respect working memory limitations'),

    // Schema & Knowledge (right)
    node(SCHEMA_THEORY, 'Schema Theory', 'theory', 920, 340, 'Knowledge is organized into mental frameworks that guide understanding'),
    node(PIAGET, 'Jean Piaget', 'person', 1100, 400, 'Developmental psychologist who formalized schema theory'),

    // Higher-order learning (top-center)
    node(METACOGNITION, 'Metacognition', 'concept', 560, 60, 'Awareness and control of one\'s own thinking and learning processes'),
    node(TRANSFER, 'Transfer of Learning', 'concept', 810, 450, 'Applying knowledge or skills learned in one context to new situations'),

    // Study strategies (bottom-center)
    node(RETRIEVAL_PRACTICE, 'Retrieval Practice', 'concept', 550, 500, 'Actively recalling information strengthens memory more than re-reading'),
    node(INTERLEAVING, 'Interleaving', 'fact', 710, 550, 'Mixing different topics during study improves discrimination and retention'),

    // ZPD cluster (far right)
    node(ZPD, 'Zone of Proximal Development', 'theory', 1050, 530, 'The gap between what a learner can do alone and with guidance'),
    node(VYGOTSKY, 'Lev Vygotsky', 'person', 1150, 440, 'Psychologist who introduced the concept of ZPD and scaffolding'),
  ],

  edges: [
    // Cognitive Science hub connections
    edge('e001', COGNITIVE_SCIENCE, MEMORY, 'part-of', 'studies'),
    edge('e002', COGNITIVE_SCIENCE, ATTENTION, 'part-of', 'studies'),
    edge('e003', COGNITIVE_SCIENCE, METACOGNITION, 'part-of', 'studies'),

    // Memory structure
    edge('e004', MEMORY, WORKING_MEMORY, 'part-of'),
    edge('e005', MEMORY, LONG_TERM_MEMORY, 'part-of'),
    edge('e006', WORKING_MEMORY, LONG_TERM_MEMORY, 'related-to', 'encodes into'),
    edge('e007', CHUNKING, WORKING_MEMORY, 'influences', 'expands effective capacity'),

    // Forgetting & repetition
    edge('e008', LONG_TERM_MEMORY, FORGETTING_CURVE, 'explains', 'decay over time'),
    edge('e009', SPACED_REPETITION, FORGETTING_CURVE, 'related-to', 'counteracts'),
    edge('e010', EBBINGHAUS, FORGETTING_CURVE, 'related-to', 'discovered'),
    edge('e011', SPACED_REPETITION, LONG_TERM_MEMORY, 'influences', 'strengthens'),

    // Attention & cognitive load
    edge('e012', ATTENTION, WORKING_MEMORY, 'prerequisite', 'gates input'),
    edge('e013', COGNITIVE_LOAD, WORKING_MEMORY, 'explains', 'limited capacity'),
    edge('e014', ATTENTION, COGNITIVE_LOAD, 'related-to'),

    // Schema theory
    edge('e015', SCHEMA_THEORY, LONG_TERM_MEMORY, 'explains', 'organization of knowledge'),
    edge('e016', PIAGET, SCHEMA_THEORY, 'related-to', 'formalized'),
    edge('e017', SCHEMA_THEORY, TRANSFER, 'influences', 'enables'),

    // Study strategies
    edge('e018', RETRIEVAL_PRACTICE, LONG_TERM_MEMORY, 'influences', 'strengthens traces'),
    edge('e019', RETRIEVAL_PRACTICE, SPACED_REPETITION, 'related-to', 'complementary strategy'),
    edge('e020', INTERLEAVING, TRANSFER, 'influences', 'promotes'),

    // ZPD
    edge('e021', VYGOTSKY, ZPD, 'related-to', 'introduced'),
    edge('e022', ZPD, COGNITIVE_LOAD, 'related-to', 'optimal challenge level'),
  ]
}
