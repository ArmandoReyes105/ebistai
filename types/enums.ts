export enum Stage {
  Applied = 1,
  Interview = 2,
  TechnicalInterview = 3,
  Offer = 4,
  Assessment = 5,
}

export enum Status {
  Active = 1,
  Rejected = 2,
  Withdrawn = 3,
  OfferAccepted = 4,
  Ignored = 5,
  OfferDeclined = 6,
  PositionClosed = 7,
}

export enum WorkMode {
  Remote = 1,
  Hybrid = 2,
  OnSite = 3,
}

export enum Actor {
  User = 1,
  System = 2,
  Ai = 3,
}

export enum ApplicationEventField {
  Stage = 1,
  Status = 2,
}
