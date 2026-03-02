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

  // Global
  icon_zoom_threshold: number
  text_zoom_threshold: number
}

export const DEFAULT_RENDER_PARAMS: GraphWebGLRenderParams = {
  // Nodes
  node_corner_radius: 10,
  node_border_width_px: 1,
  node_accent_width_px: 3,
  node_shadow_strength: 0.14,
  node_shadow_blur_px: 14,
  node_shadow_offset_px: 4,
  node_inner_highlight: 0.06,
  node_selection_ring_width_px: 2,
  node_selection_ring_offset_px: 2,
  node_focus_glow_intensity: 0.35,
  node_focus_glow_radius_px: 28,
  node_padding_px: 16,

  // Edges
  edge_width_scale: 1,
  edge_hover_width_scale: 1.6,
  edge_hover_mix: 0,
  edge_aa_softness: 1,
  edge_dash_length_px: 6,
  edge_dash_gap_px: 6,
  edge_curvature: 0.3,
  edge_glow_intensity: 0,
  edge_glow_radius_px: 18,

  // Text
  text_font_size: 16,
  text_weight: 0,
  text_contrast: 1.15,
  text_px_range_scale: 1,
  text_max_lines: 2,
  text_ellipsis: true,

  // Global
  icon_zoom_threshold: 0.5,
  text_zoom_threshold: 0.3
}

