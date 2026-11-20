export interface AppEntry {
  slug: string
  title: string
  description: string
  status: 'coming-soon' | 'live'
}

// Add a new app here to get a page at /apps/<slug>
export const apps: AppEntry[] = [
  {
    slug: 'namma-metro-quizz',
    title: 'Namma Metro Quizz',
    description: 'Guess the Namma Metro station names from the map.',
    status: 'coming-soon',
  },
]

export const getApp = (slug: string) => apps.find((a) => a.slug === slug)
