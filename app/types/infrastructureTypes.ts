export interface Capability {
    id: string
    name: string
    status: "Healthy" | "Compromised" | "Unknown"
    lastUpdated: Date
}

export interface Zone {
    id: string
    name: string
    lastUpdated: Date
}

export interface Server {
    id: string
    name: string
    status: "Healthy" | "Compromised" | "Unknown"
    zoneId: string
    lastUpdated: Date
}

export interface StatusUpdate {
    id: string
    type: "Capability" | "Server"
    status: "Healthy" | "Compromised" | "Unknown"
    timestamp: Date
}

export interface CapabilityZoneRelation {
    capabilityId: string
    zoneId: string
}