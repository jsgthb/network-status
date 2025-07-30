import { defineStore } from "pinia"

export interface Capability {
    id: string
    name: string
    status: "Healthy" | "Compromised" | "Unknown"
    lastUpdated: Date
}

export interface Zone {
    id: string
    name: string
    capabilityId: string
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

export const useInfrastructureStore = defineStore("infrastructure", () => {
    // State
    const capabilities = ref<Map<string, Capability>>(new Map)
    const zones = ref<Map<string, Zone>>(new Map)
    const servers = ref<Map<string, Server>>(new Map)

    // Lookup tables
    const serversByZone = ref<Map<string, Set<string>>>(new Map())
    const zonesByCapability = ref<Map<string, Set<string>>>(new Map())
    const serversByStatus = ref<Map<string, Set<string>>>(new Map())
    const capabilitiesByStatus = ref<Map<string, Set<string>>>(new Map())

    // Zone health cache which is updated when servers change
    const zoneHealthCache = ref<Map<string, string>>(new Map)

    // Lookup table index maintenance helpers
    const addToIndex = <K, V>(index: Map<K, Set<V>>, key: K, value: V) => {
        if (!index.has(key)) {
            index.set(key, new Set())
        }
        index.get(key)!.add(value)
    }
    const removeFromIndex = <K, V>(index: Map<K, Set<V>>, key: K, value: V) => {
        const set = index.get(key)
        if (set) {
            set.delete(value)
            if (set.size === 0) {
                index.delete(key)
            }
        }
    }
    const rebuildIndexes = () => {
        serversByZone.value.clear()
        zonesByCapability.value.clear()
        serversByStatus.value.clear()
        capabilitiesByStatus.value.clear()
        zoneHealthCache.value.clear()

        // Server indexes
        for (const server of servers.value.values()) {
            addToIndex(serversByZone.value, server.zoneId, server.id)
            addToIndex(serversByStatus.value, server.status, server.id)
        }

        // Zone indexes
        for (const zone of zones.value.values()) {
            addToIndex(zonesByCapability.value, zone.capabilityId, zone.id)
        }

        // Capability indexes
        for (const capability of capabilities.value.values()) {
            addToIndex(capabilitiesByStatus.value, capability.status, capability.id)
        }
    }

    // TODO Load data through YAML
    const initializePlaceholderData = () => {
        // Capabilities
        const placeholderCapabilities: Capability[] = [
            {
                id: "cap-web-services",
                name: "Web Services",
                status: "Healthy",
                lastUpdated: new Date()
            },
            {
                id: "cap-data-storage",
                name: "Data Storage",
                status: "Compromised",
                lastUpdated: new Date()
            },
            {
                id: "cap-api-gateway",
                name: "API Gateway",
                status: "Healthy",
                lastUpdated: new Date()
            }
        ]

        // Zones
        const placeholderZones: Zone[] = [
            {
                id: "zone-us-east",
                name: "US East",
                capabilityId: "cap-web-services",
                lastUpdated: new Date()
            },
            {
                id: "zone-us-west",
                name: "US West",
                capabilityId: "cap-web-services",
                lastUpdated: new Date()
            },
            {
                id: "zone-eu-central",
                name: "EU Central",
                capabilityId: "cap-data-storage",
                lastUpdated: new Date()
            },
            {
                id: "zone-asia-pacific",
                name: "Asia Pacific",
                capabilityId: "cap-api-gateway",
                lastUpdated: new Date()
            }
        ]

        // Servers
        const placeholderServers: Server[] = [
            // US East Zone (Web Services Capability)
            {
                id: "server-use-web-01",
                name: "Web Server 01",
                status: "Healthy",
                zoneId: "zone-us-east",
                lastUpdated: new Date()
            },
            {
                id: "server-use-web-02",
                name: "Web Server 02",
                status: "Healthy",
                zoneId: "zone-us-east",
                lastUpdated: new Date()
            },
            // US West Zone (Web Services Capability)
            {
                id: "server-usw-web-01",
                name: "Web Server 01",
                status: "Healthy",
                zoneId: "zone-us-west",
                lastUpdated: new Date()
            },
            {
                id: "server-usw-web-02",
                name: "Web Server 02",
                status: "Healthy",
                zoneId: "zone-us-west",
                lastUpdated: new Date()
            },
            // EU Central Zone (Data Storage Capability)
            {
                id: "server-eu-db-01",
                name: "Database Server 01",
                status: "Healthy",
                zoneId: "zone-eu-central",
                lastUpdated: new Date()
            },
            {
                id: "server-eu-cache-01",
                name: "Cache Server 01",
                status: "Healthy",
                zoneId: "zone-eu-central",
                lastUpdated: new Date()
            },
            // Asia Pacific Zone (API Gateway Capability)
            {
                id: "server-ap-api-01",
                name: "API Server 01",
                status: "Healthy",
                zoneId: "zone-asia-pacific",
                lastUpdated: new Date()
            },
            {
                id: "server-ap-lb-01",
                name: "Load Balancer 01",
                status: "Healthy",
                zoneId: "zone-asia-pacific",
                lastUpdated: new Date()
            }
        ]

        // Populate state
        capabilities.value.clear()
        placeholderCapabilities.forEach(capability => capabilities.value.set(capability.id, capability))
        
        zones.value.clear()
        placeholderZones.forEach(zone => zones.value.set(zone.id, zone))

        servers.value.clear()
        placeholderServers.forEach(server => servers.value.set(server.id, server))   
        
        // Rebuild lookup table indexes with state
        rebuildIndexes()
    }

    // Basic getters
    const capabilitiesList = computed(() => Array.from(capabilities.value.values()))
    const zonesList = computed(() => Array.from(zones.value.values()))
    const serversList = computed(() => Array.from(servers.value.values()))

    const getCapabilityById = (id: string) => capabilities.value.get(id)
    const getZoneById = (id: string) => zones.value.get(id)
    const getServerById = (id: string) => servers.value.get(id)

    const getZonesByCapability = (capabilityId: string): Zone[] => {
        const zoneIds = zonesByCapability.value.get(capabilityId) || new Set()
        return Array.from(zoneIds).map(id => zones.value.get(id)!).filter(Boolean)
    }
    const getServersByZone = (zoneId: string): Server[] => {
        const serverIds = serversByZone.value.get(zoneId) || new Set()
        return Array.from(serverIds).map(id => servers.value.get(id)!).filter(Boolean)
    }
    const getServersByCapability = (capabilityId: string): Server[] => {
        const zoneIds = zonesByCapability.value.get(capabilityId) || new Set()
        const servers: Server[] = []

        for (const zoneId of zoneIds) {
            const zoneServerIds = serversByZone.value.get(zoneId) || new Set()
            for (const serverId of zoneServerIds) {
                const server = getServerById(serverId)
                if (server) servers.push(server)
            }
        }

        return servers
    }

    // Status based getters
    const healthyCapabilities = computed(() => {
        const ids = capabilitiesByStatus.value.get("Healthy") || new Set()
        return Array.from(ids).map(id => capabilities.value.get(id)!).filter(Boolean)
    })
    const compromisedCapabilities = computed(() => {
        const ids = capabilitiesByStatus.value.get("Compromised") || new Set()
        return Array.from(ids).map(id => capabilities.value.get(id)!).filter(Boolean)
    })
    const unknownCapabilities = computed(() => {
        const ids = capabilitiesByStatus.value.get("Unknown") || new Set()
        return Array.from(ids).map(id => capabilities.value.get(id)!).filter(Boolean)
    })
    const healthyServers = computed(() => {
        const ids = serversByStatus.value.get("Healthy") || new Set()
        return Array.from(ids).map(id => servers.value.get(id)!).filter(Boolean)
    })
    const compromisedServers = computed(() => {
        const ids = serversByStatus.value.get("Compromised") || new Set()
        return Array.from(ids).map(id => servers.value.get(id)!).filter(Boolean)
    })
    const unknownServers = computed(() => {
        const ids = serversByStatus.value.get("Unknown") || new Set()
        return Array.from(ids).map(id => servers.value.get(id)!).filter(Boolean)
    })
    const getZoneHealth = (zoneId: string): string => {
        // Check cache
        if (zoneHealthCache.value.has(zoneId)) {
            return zoneHealthCache.value.get(zoneId)!
        }

        // Calculate health
        const serverIds = serversByZone.value.get(zoneId) || new Set()
        if (serverIds.size === 0) {
            zoneHealthCache.value.set(zoneId, "Healthy")
            return "Healthy"
        }

        let hasCompromised = false
        let hasUnknown = false

        for (const serverId of serverIds) {
            const server = servers.value.get(serverId)
            if (server) {
                if (server.status === "Compromised") hasCompromised = true
                if (server.status === "Unknown") hasUnknown = true
            }
        }

        const health = hasCompromised ? "Compromised" : hasUnknown ? "Unknown" : "Healthy"
        zoneHealthCache.value.set(zoneId, health)
        return health
    }

    // Actions
    const updateCapabilityStatus = (update: StatusUpdate) => {
        if (update.type !== "Capability") return

        const capability = capabilities.value.get(update.id)
        if (!capability) return

        const oldStatus = capability.status

        const updatedCapability = {
            ...capability,
            status: update.status,
            lastUpdated: new Date(update.timestamp)
        }
        capabilities.value.set(update.id, updatedCapability)

        removeFromIndex(capabilitiesByStatus.value, oldStatus, update.id)
        addToIndex(capabilitiesByStatus.value, update.status, update.id)
    }
    const updateServerStatus = (update: StatusUpdate) => {
        if (update.type !== "Server") return

        const server = servers.value.get(update.id)
        if (!server) return

        const oldStatus = server.status

        const updatedServer = {
            ...server,
            status: update.status,
            lastUpdated: new Date(update.timestamp)
        }
        servers.value.set(update.id, updatedServer)

        removeFromIndex(serversByStatus.value, oldStatus, update.id)
        addToIndex(serversByStatus.value, update.status, update.id)

        // Invalidate zone health cache for affected zone
        zoneHealthCache.value.delete(server.zoneId)
    }

    // Initialize data on store creation
    initializePlaceholderData()

    return {
        // State
        capabilities: readonly(capabilities),
        zones: readonly(zones),
        servers: readonly(servers),

        // Lists
        capabilitiesList,
        zonesList,
        serversList,

        //  Direct access
        getCapabilityById,
        getZoneById,
        getServerById,

        // Lookups
        getZonesByCapability,
        getServersByZone,
        getServersByCapability,

        // Status filters
        healthyCapabilities,
        compromisedCapabilities,
        unknownCapabilities,
        healthyServers,
        compromisedServers,
        unknownServers,

        // Health calculation
        getZoneHealth,

        // Actions
        updateCapabilityStatus,
        updateServerStatus,
        initializePlaceholderData,
        rebuildIndexes
    }
})
