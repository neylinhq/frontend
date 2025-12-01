import { mergeAttributes, Node } from '@tiptap/core'

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, unknown>
  allowFullscreen: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { src: string }) => ReturnType
    }
  }
}

const parseVideoUrl = (url: string) => {
  // FIX: Validate input - handle null, undefined, empty strings
  if (!url || typeof url !== 'string') {
    return null
  }
  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  // YouTube
  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (youtubeMatch) {
    return { platform: 'youtube', videoId: youtubeMatch[1] }
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch) {
    return { platform: 'vimeo', videoId: vimeoMatch[1] }
  }

  // Loom
  const loomMatch = trimmed.match(/(?:loom\.com\/share\/)([a-zA-Z0-9]+)/)
  if (loomMatch) {
    return { platform: 'loom', videoId: loomMatch[1] }
  }

  return null
}

const isValidVideoId = (platform: string, videoId: string) => {
  if (!videoId || typeof videoId !== 'string') {
    return false
  }

  switch (platform) {
    case 'youtube':
      // YouTube video IDs are exactly 11 characters: alphanumeric, dash, underscore
      return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    case 'vimeo':
      // Vimeo video IDs are numeric
      return /^\d+$/.test(videoId)
    case 'loom':
      // Loom video IDs are alphanumeric
      return /^[a-zA-Z0-9]+$/.test(videoId)
    default:
      return false
  }
}

const getEmbedUrl = (platform: string, videoId: string) => {
  // Validate videoId before creating URL
  if (!isValidVideoId(platform, videoId)) {
    return ''
  }

  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`
    case 'loom':
      return `https://www.loom.com/embed/${videoId}`
    default:
      return ''
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowFullscreen: true
    }
  },

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      platform: {
        default: null
      },
      videoId: {
        default: null
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { platform, videoId } = HTMLAttributes
    const embedUrl = platform && videoId ? getEmbedUrl(platform, videoId) : ''

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-video-embed': '',
        class: 'editor-video-embed'
      }),
      [
        'div',
        { class: 'editor-video-embed-wrapper' },
        [
          'iframe',
          {
            src: embedUrl,
            frameborder: '0',
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: this.options.allowFullscreen ? 'true' : undefined
          }
        ]
      ]
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
        options =>
        ({ commands }) => {
          const parsed = parseVideoUrl(options.src)
          if (!parsed) {
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              platform: parsed.platform,
              videoId: parsed.videoId
            }
          })
        }
    }
  }
})
