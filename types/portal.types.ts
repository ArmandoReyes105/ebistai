export interface PortalApplication {
  id: string
  jobTitle: string
  company: string
}

export interface Portal {
  id: string
  name: string
  url: string
  notes?: string | null
  applications: PortalApplication[]
}

export interface SavePortalRequest {
  name: string
  url: string
  notes?: string
}
