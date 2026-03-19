export type GraphWebGLRenderParams = {
  // Nodes
  node_corner_radius: number
  node_border_width_px: number
  node_accent_width_px: number
  node_shadow_strength: number
  node_shadow_blur_px: number
  node_shadow_offset_px: number
  node_inner_highlight: number
  node_selection_ring_width_px: number
  node_selection_ring_offset_px: number
  node_focus_glow_intensity: number
  node_focus_glow_radius_px: number
  node_padding_px: number

  // Edges
  edge_width_scale: number
  edge_hover_width_scale: number
  edge_hover_mix: number
  edge_aa_softness: number
  edge_dash_length_px: number
  edge_dash_gap_px: number
  edge_curvature: number
  edge_glow_intensity: number
  edge_glow_radius_px: number

  // Text
  text_font_size: number
  text_weight: number
  text_contrast: number
  text_px_range_scale: number
  text_max_lines: number
  text_ellipsis: boolean

  // Grid
  grid_enabled: boolean
  grid_spacing: number
  grid_dot_radius: number
  grid_dot_opacity: number

  // Global
  icon_zoom_threshold: number
  text_zoom_threshold: number
}

export const DEFAULT_RENDER_PARAMS: GraphWebGLRenderParams = {
  // Nodes — FigJam-level card styling
  node_corner_radius: 8,
  node_border_width_px: 1,
  node_accent_width_px: 3.5,
  node_shadow_strength: 0.0,
  node_shadow_blur_px: 16,
  node_shadow_offset_px: 3,
  node_inner_highlight: 0.04,
  node_selection_ring_width_px: 2,
  node_selection_ring_offset_px: 3,
  node_focus_glow_intensity: 0.3,
  node_focus_glow_radius_px: 24,
  node_padding_px: 16,

  // Edges — smooth and subtle
  edge_width_scale: 1,
  edge_hover_width_scale: 1.6,
  edge_hover_mix: 0,
  edge_aa_softness: 1.2,
  edge_dash_length_px: 7,
  edge_dash_gap_px: 5,
  edge_curvature: 0.3,
  edge_glow_intensity: 0,
  edge_glow_radius_px: 18,

  // Text — crisp SDF
  text_font_size: 16,
  text_weight: 0.12,
  text_contrast: 1.4,
  text_px_range_scale: 1.3,
  text_max_lines: 2,
  text_ellipsis: true,

  // Grid — FigJam-style: world-space dots
  grid_enabled: true,
  grid_spacing: 24,
  grid_dot_radius: 1.5,
  grid_dot_opacity: 1.0,

  // Global
  icon_zoom_threshold: 0.15,
  text_zoom_threshold: 0.1
}
