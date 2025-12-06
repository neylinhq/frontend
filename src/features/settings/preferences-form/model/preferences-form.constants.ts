export interface NotificationSwitchSetting {
  id: string
  field: 'email' | 'marketing' | 'updates'
  section: 'notifications'
  labelKey: string
  descriptionKey: string
}

export interface InterfaceSwitchSetting {
  id: string
  field: 'animations' | 'sound'
  section: 'interface'
  labelKey: string
  descriptionKey: string
}

export const NOTIFICATION_SETTINGS: NotificationSwitchSetting[] = [
  {
    id: 'email-notifications',
    field: 'email',
    section: 'notifications',
    labelKey: 'settings.preferences.notifications.email',
    descriptionKey: 'settings.preferences.notifications.emailDescription'
  },
  {
    id: 'marketing',
    field: 'marketing',
    section: 'notifications',
    labelKey: 'settings.preferences.notifications.marketing',
    descriptionKey: 'settings.preferences.notifications.marketingDescription'
  },
  {
    id: 'updates',
    field: 'updates',
    section: 'notifications',
    labelKey: 'settings.preferences.notifications.updates',
    descriptionKey: 'settings.preferences.notifications.updatesDescription'
  }
]

export const INTERFACE_SWITCH_SETTINGS: InterfaceSwitchSetting[] = [
  {
    id: 'animations',
    field: 'animations',
    section: 'interface',
    labelKey: 'settings.preferences.interface.animations',
    descriptionKey: 'settings.preferences.interface.animationsDescription'
  },
  {
    id: 'sound',
    field: 'sound',
    section: 'interface',
    labelKey: 'settings.preferences.interface.sound',
    descriptionKey: 'settings.preferences.interface.soundDescription'
  }
]

export interface DensityOption {
  value: 'compact' | 'comfortable' | 'spacious'
  labelKey: string
}

export const DENSITY_OPTIONS: DensityOption[] = [
  {
    value: 'compact',
    labelKey: 'settings.preferences.interface.densityCompact'
  },
  {
    value: 'comfortable',
    labelKey: 'settings.preferences.interface.densityComfortable'
  },
  {
    value: 'spacious',
    labelKey: 'settings.preferences.interface.densitySpacious'
  }
]
