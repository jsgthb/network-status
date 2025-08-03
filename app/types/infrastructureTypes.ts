export interface Capability {
    id: string
    name: string
    status: Status
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
    status: Status
    zoneId: string
    lastUpdated: Date
    description: {
        os: string
        ipv4: Array<string>
        ipv6: Array<string>
    }
}

export interface StatusUpdate {
    id: string
    type: "Capability" | "Server"
    status: Status
    timestamp: Date
}

export interface CapabilityZoneRelation {
    capabilityId: string
    zoneId: string
}

export interface InfrastructureState {
    capabilities: Capability[]
    zones: Zone[]
    servers: Server[]
    capabilityZoneRelations: CapabilityZoneRelation[]
}

export enum Status {
    Green = "Healthy",
    Yellow = "Unknown",
    Red= "Compromised"
}