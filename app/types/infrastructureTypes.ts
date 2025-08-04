export interface Capability {
    id: string
    name: string
    status: StatusCapability
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
    status: StatusServer
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
    status: StatusServer | StatusCapability
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

// Also used for zones
export enum StatusServer {
    Green = "Secure",
    Yellow = "Unknown",
    Red= "Compromised"
}

export enum StatusCapability {
    Green = "Operational",
    Yellow = "Degraded",
    Red= "Offline"
}