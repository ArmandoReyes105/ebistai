import { Stage, Status } from "./enums"

export interface PortalApplication {
  id: string
  jobTitle: string
  company: string
  status: Status
  stage: Stage
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
