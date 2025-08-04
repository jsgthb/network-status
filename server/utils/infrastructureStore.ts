import {
    Capability,
    Zone,
    Server,
    CapabilityZoneRelation,
    InfrastructureState,
    StatusServer,
    StatusCapability
} from "~/types/infrastructureTypes"

class InfrastructureStore {
    private capabilities = new Map<string, Capability>()
    private zones = new Map<string, Zone>()
    private servers = new Map<string, Server>()
    private capabilityZoneRelations = new Set<string>()

    constructor() {
        this.initializePlaceholderData()
    }

    private initializePlaceholderData() {
        // Capabilities
        const placeholderCapabilities: Capability[] = [
            {
                id: "cap-web-services",
                name: "Web Services",
                status: StatusCapability.Green,
                lastUpdated: new Date()
            },
            {
                id: "cap-data-storage",
                name: "Data Storage",
                status: StatusCapability.Green,
                lastUpdated: new Date()
            },
            {
                id: "cap-api-gateway",
                name: "API Gateway",
                status: StatusCapability.Green,
                lastUpdated: new Date()
            }
        ]

        // Zones
        const placeholderZones: Zone[] = [
            {
                id: "zone-us-east",
                name: "US East",
                lastUpdated: new Date()
            },
            {
                id: "zone-us-west",
                name: "US West",
                lastUpdated: new Date()
            },
            {
                id: "zone-eu-central",
                name: "EU Central",
                lastUpdated: new Date()
            },
            {
                id: "zone-asia-pacific",
                name: "Asia Pacific",
                lastUpdated: new Date()
            }
        ]

        // Servers
        const placeholderServers: Server[] = [
            // US East Zone (Web Services Capability)
            {
                id: "server-use-web-01",
                name: "Web Server 01",
                status: StatusServer.Green,
                zoneId: "zone-us-east",
                lastUpdated: new Date(),
                description: {
                    os: "Debian 12",
                    ipv4: [],
                    ipv6: []
                }
            },
            {
                id: "server-use-web-02",
                name: "Web Server 02",
                status: StatusServer.Green,
                zoneId: "zone-us-east",
                lastUpdated: new Date(),
                description: {
                    os: "Debian 12",
                    ipv4: [],
                    ipv6: []
                }
            },
            // US West Zone (Web Services Capability)
            {
                id: "server-usw-web-01",
                name: "Web Server 01",
                status: StatusServer.Green,
                zoneId: "zone-us-west",
                lastUpdated: new Date(),
                description: {
                    os: "Windows Server 2025",
                    ipv4: [],
                    ipv6: []
                }
            },
            {
                id: "server-usw-web-02",
                name: "Web Server 02",
                status: StatusServer.Green,
                zoneId: "zone-us-west",
                lastUpdated: new Date(),
                description: {
                    os: "Windows Server 2025",
                    ipv4: [],
                    ipv6: []
                }
            },
            // EU Central Zone (Data Storage Capability)
            {
                id: "server-eu-db-01",
                name: "Database Server 01",
                status: StatusServer.Green,
                zoneId: "zone-eu-central",
                lastUpdated: new Date(),
                description: {
                    os: "FreeBSD 14.1",
                    ipv4: [],
                    ipv6: []
                }
            },
            {
                id: "server-eu-cache-01",
                name: "Cache Server 01",
                status: StatusServer.Green,
                zoneId: "zone-eu-central",
                lastUpdated: new Date(),
                description: {
                    os: "CentOS Stream 9",
                    ipv4: [],
                    ipv6: []
                }
            },
            // Asia Pacific Zone (API Gateway Capability)
            {
                id: "server-ap-api-01",
                name: "API Server 01",
                status: StatusServer.Green,
                zoneId: "zone-asia-pacific",
                lastUpdated: new Date(),
                description: {
                    os: "RHEL 10",
                    ipv4: [],
                    ipv6: []
                }
            },
            {
                id: "server-ap-lb-01",
                name: "Load Balancer 01",
                status: StatusServer.Green,
                zoneId: "zone-asia-pacific",
                lastUpdated: new Date(),
                description: {
                    os: "Arch Linux 2025.07.01",
                    ipv4: [],
                    ipv6: []
                }
            }
        ]

        // Capability zone relationships
        const placeholderRelations: CapabilityZoneRelation[] = [
            // Web services
            { capabilityId: "cap-web-services", zoneId: "zone-us-east"},
            { capabilityId: "cap-web-services", zoneId: "zone-us-west"},
            // Data storage
            { capabilityId: "cap-data-storage", zoneId: "zone-us-east"},
            { capabilityId: "cap-data-storage", zoneId: "zone-us-west"},
            { capabilityId: "cap-data-storage", zoneId: "zone-eu-central"},
            // API gateway
            { capabilityId: "cap-api-gateway", zoneId: "zone-asia-pacific"},
        ]

        // Populate state
        placeholderCapabilities.forEach(capability =>
            this.capabilities.set(capability.id, capability)
        )
        placeholderZones.forEach(zone => 
            this.zones.set(zone.id, zone)
        )
        placeholderServers.forEach(server => 
            this.servers.set(server.id, server)
        )
        placeholderRelations.forEach(relation => {
            const relationKey = `${relation.capabilityId}::${relation.zoneId}`
            this.capabilityZoneRelations.add(relationKey)
        })
    }

    replaceState(newState: InfrastructureState): void {
        console.log("Replacing infrastructure store state...")

        // Clear existing state
        this.capabilities.clear()
        this.zones.clear()
        this.servers.clear()
        this.capabilityZoneRelations.clear()

        // Load new state
        newState.capabilities.forEach(capability => {
            this.capabilities.set(capability.id, capability)
        })
        
        newState.zones.forEach(zone => {
            this.zones.set(zone.id, zone)
        })
        
        newState.servers.forEach(server => {
            this.servers.set(server.id, server)
        })
        
        newState.capabilityZoneRelations.forEach(relation => {
            const relationKey = `${relation.capabilityId}::${relation.zoneId}`
            this.capabilityZoneRelations.add(relationKey)
        })
        
        console.log("Infrastructure store state replaced successfully")
    }

    getCurrentState(): InfrastructureState {
        return {
            capabilities: Array.from(this.capabilities.values()),
            zones: Array.from(this.zones.values()),
            servers: Array.from(this.servers.values()),
            capabilityZoneRelations: Array.from(this.capabilityZoneRelations).map(relationKey => {
                const [capabilityId, zoneId] = relationKey.split("::")
                return { capabilityId, zoneId }
            }),
        }
    }

    updateCapabilityStatus(update: any): boolean {
        if (update.type !== "Capability") return false

        const capability = this.capabilities.get(update.id)
        if (!capability) return false

        const updatedCapability: Capability = {
            ...capability,
            status: update.status,
            lastUpdated: new Date(update.timestamp)
        }

        this.capabilities.set(update.id, updatedCapability)
        return true
    }

    updateServerStatus(update: any): boolean {
        if (update.type !== "Server") return false

        const server = this.servers.get(update.id)
        if (!server) return false

        const updatedServer: Server = {
            ...server,
            status: update.status,
            lastUpdated: new Date(update.timestamp)
        }

        this.servers.set(update.id, updatedServer)
        return true
    }
}

// Singleton
export const infrastructureStore = new InfrastructureStore()