import type { TFunction } from 'i18next'

import type { FullMap } from '@/entities/map'

export const DEMO_MAP_ID = 'demo-cognitive-science'
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
  mapId: DEMO_MAP_ID,
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
  mapId: DEMO_MAP_ID,
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

export const getDemoMap = (t: TFunction): FullMap => ({
  id: DEMO_MAP_ID,
  title: t('demo.map.title', 'How Learning Works'),
  description: t('demo.map.description', 'A cognitive science map exploring the mechanisms behind effective learning'),
  createdAt: NOW,
  updatedAt: NOW,
  nodesCount: 18,
  edgesCount: 22,
  isPublic: true,

  nodes: [
    node(COGNITIVE_SCIENCE, t('demo.nodes.cognitiveScience', 'Cognitive Science'), 'concept', 580, 280, t('demo.nodes.cognitiveScience.desc', 'The interdisciplinary study of the mind and its processes')),

    node(MEMORY, t('demo.nodes.memory', 'Memory'), 'concept', 250, 200, t('demo.nodes.memory.desc', 'The faculty of encoding, storing, and retrieving information')),
    node(WORKING_MEMORY, t('demo.nodes.workingMemory', 'Working Memory'), 'concept', 80, 100, t('demo.nodes.workingMemory.desc', 'Limited-capacity system for temporary information storage and manipulation')),
    node(LONG_TERM_MEMORY, t('demo.nodes.longTermMemory', 'Long-Term Memory'), 'concept', 80, 320, t('demo.nodes.longTermMemory.desc', 'Virtually unlimited store for knowledge and past events')),
    node(CHUNKING, t('demo.nodes.chunking', 'Chunking'), 'fact', 30, 210, t('demo.nodes.chunking.desc', 'Grouping individual pieces of information into larger meaningful units')),

    node(FORGETTING_CURVE, t('demo.nodes.forgettingCurve', 'Forgetting Curve'), 'theory', 320, 460, t('demo.nodes.forgettingCurve.desc', 'Memory retention decays exponentially without reinforcement')),
    node(SPACED_REPETITION, t('demo.nodes.spacedRepetition', 'Spaced Repetition'), 'concept', 130, 470, t('demo.nodes.spacedRepetition.desc', 'Reviewing material at increasing intervals to optimize retention')),
    node(EBBINGHAUS, t('demo.nodes.ebbinghaus', 'Hermann Ebbinghaus'), 'person', 250, 560, t('demo.nodes.ebbinghaus.desc', 'Pioneer of memory research who discovered the forgetting curve')),

    node(ATTENTION, t('demo.nodes.attention', 'Attention'), 'concept', 830, 120, t('demo.nodes.attention.desc', 'Selective concentration on relevant information while ignoring distractions')),
    node(COGNITIVE_LOAD, t('demo.nodes.cognitiveLoad', 'Cognitive Load Theory'), 'theory', 1020, 200, t('demo.nodes.cognitiveLoad.desc', 'Instructional design must respect working memory limitations')),

    node(SCHEMA_THEORY, t('demo.nodes.schemaTheory', 'Schema Theory'), 'theory', 920, 340, t('demo.nodes.schemaTheory.desc', 'Knowledge is organized into mental frameworks that guide understanding')),
    node(PIAGET, t('demo.nodes.piaget', 'Jean Piaget'), 'person', 1100, 400, t('demo.nodes.piaget.desc', 'Developmental psychologist who formalized schema theory')),

    node(METACOGNITION, t('demo.nodes.metacognition', 'Metacognition'), 'concept', 560, 60, t('demo.nodes.metacognition.desc', 'Awareness and control of one\'s own thinking and learning processes')),
    node(TRANSFER, t('demo.nodes.transfer', 'Transfer of Learning'), 'concept', 810, 450, t('demo.nodes.transfer.desc', 'Applying knowledge or skills learned in one context to new situations')),

    node(RETRIEVAL_PRACTICE, t('demo.nodes.retrievalPractice', 'Retrieval Practice'), 'concept', 550, 500, t('demo.nodes.retrievalPractice.desc', 'Actively recalling information strengthens memory more than re-reading')),
    node(INTERLEAVING, t('demo.nodes.interleaving', 'Interleaving'), 'fact', 710, 550, t('demo.nodes.interleaving.desc', 'Mixing different topics during study improves discrimination and retention')),

    node(ZPD, t('demo.nodes.zpd', 'Zone of Proximal Development'), 'theory', 1050, 530, t('demo.nodes.zpd.desc', 'The gap between what a learner can do alone and with guidance')),
    node(VYGOTSKY, t('demo.nodes.vygotsky', 'Lev Vygotsky'), 'person', 1150, 440, t('demo.nodes.vygotsky.desc', 'Psychologist who introduced the concept of ZPD and scaffolding')),
  ],

  edges: [
    edge('e001', COGNITIVE_SCIENCE, MEMORY, 'part-of', t('demo.edges.studies', 'studies')),
    edge('e002', COGNITIVE_SCIENCE, ATTENTION, 'part-of', t('demo.edges.studies', 'studies')),
    edge('e003', COGNITIVE_SCIENCE, METACOGNITION, 'part-of', t('demo.edges.studies', 'studies')),

    edge('e004', MEMORY, WORKING_MEMORY, 'part-of'),
    edge('e005', MEMORY, LONG_TERM_MEMORY, 'part-of'),
    edge('e006', WORKING_MEMORY, LONG_TERM_MEMORY, 'related-to', t('demo.edges.encodesInto', 'encodes into')),
    edge('e007', CHUNKING, WORKING_MEMORY, 'influences', t('demo.edges.expandsCapacity', 'expands effective capacity')),

    edge('e008', LONG_TERM_MEMORY, FORGETTING_CURVE, 'explains', t('demo.edges.decayOverTime', 'decay over time')),
    edge('e009', SPACED_REPETITION, FORGETTING_CURVE, 'related-to', t('demo.edges.counteracts', 'counteracts')),
    edge('e010', EBBINGHAUS, FORGETTING_CURVE, 'related-to', t('demo.edges.discovered', 'discovered')),
    edge('e011', SPACED_REPETITION, LONG_TERM_MEMORY, 'influences', t('demo.edges.strengthens', 'strengthens')),

    edge('e012', ATTENTION, WORKING_MEMORY, 'prerequisite', t('demo.edges.gatesInput', 'gates input')),
    edge('e013', COGNITIVE_LOAD, WORKING_MEMORY, 'explains', t('demo.edges.limitedCapacity', 'limited capacity')),
    edge('e014', ATTENTION, COGNITIVE_LOAD, 'related-to'),

    edge('e015', SCHEMA_THEORY, LONG_TERM_MEMORY, 'explains', t('demo.edges.organizesKnowledge', 'organization of knowledge')),
    edge('e016', PIAGET, SCHEMA_THEORY, 'related-to', t('demo.edges.formalized', 'formalized')),
    edge('e017', SCHEMA_THEORY, TRANSFER, 'influences', t('demo.edges.enables', 'enables')),

    edge('e018', RETRIEVAL_PRACTICE, LONG_TERM_MEMORY, 'influences', t('demo.edges.strengthensTraces', 'strengthens traces')),
    edge('e019', RETRIEVAL_PRACTICE, SPACED_REPETITION, 'related-to', t('demo.edges.complementary', 'complementary strategy')),
    edge('e020', INTERLEAVING, TRANSFER, 'influences', t('demo.edges.promotes', 'promotes')),

    edge('e021', VYGOTSKY, ZPD, 'related-to', t('demo.edges.introduced', 'introduced')),
    edge('e022', ZPD, COGNITIVE_LOAD, 'related-to', t('demo.edges.optimalChallenge', 'optimal challenge level')),
  ]
})
