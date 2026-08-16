export type CostumeResult = {
  id: string
  name: string
  imageUrl: string | null
}

export type LookupResult =
  | { state: 'envelope'; remaining: number }
  | { state: 'drawn'; costume: CostumeResult }
  | { state: 'invalid' }

export type DrawResult =
  | { state: 'drawn'; costume: CostumeResult; displayName: string }
  | { state: 'already-drawn'; costume: CostumeResult; displayName: string }
  | { state: 'empty' }
  | { state: 'taken' }
  | { state: 'invalid' }

export type AdminPerson = {
  id: string
  display: string
}

export type AdminCostume = {
  id: string
  name: string
  imageUrl: string | null
  person: AdminPerson | null
}

export type AdminState = {
  costumes: AdminCostume[]
  total: number
  drawn: number
  remaining: number
}
