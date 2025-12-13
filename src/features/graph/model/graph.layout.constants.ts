/**
 * Layout Algorithm Constants
 *
 * These constants control the physics simulation and visual appearance
 * of the force-directed graph layout.
 */

// Physics simulation parameters
export const LAYOUT_ITERATIONS = 150 // Number of iterations for force simulation convergence
export const COOLING_FACTOR = 0.97 // Rate at which simulation energy decreases per iteration
export const IDEAL_DISTANCE_MULTIPLIER = 1.5 // Multiplier for node spacing to get ideal distance

// Force strengths
export const VERTICAL_FORCE_MULTIPLIER = 1.2 // Strength of hierarchical vertical positioning
export const HORIZONTAL_SPREAD_FACTOR = 0.3 // Anti-collapse force for same-level nodes
export const CENTER_GRAVITY_STRENGTH = 0.01 // Pull towards center to prevent drift

// Initial node placement
export const INITIAL_PLACEMENT_ANGLE = 2.4 // Golden angle for circular distribution
export const INITIAL_RADIUS = 200 // Radius of initial circular placement
export const INITIAL_RANDOM_JITTER = 50 // Random offset to break symmetry

// Barnes-Hut optimization
export const BARNES_HUT_THETA = 0.9 // Approximation threshold (0=exact, 1=fast approximation)
export const DEFAULT_QUADTREE_SIZE = 1000 // Default quadtree extent size

// UI constants
export const DEFAULT_NODE_WIDTH = 200
export const DEFAULT_NODE_HEIGHT = 100
export const FIT_VIEW_PADDING = 0.1
export const SNAP_GRID_SIZE = 15

// Temperature limits
export const INITIAL_TEMPERATURE_FACTOR = 0.5 // temperature = idealDistance * this
