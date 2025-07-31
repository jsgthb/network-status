import { defineStore } from "pinia"
import type {
    Zone,
    Capability,
    Server,
    StatusUpdate,
    CapabilityZoneRelation,
    InfrastructureState
} from "~/types/infrastructureTypes"

export const useInfrastructureStore = defineStore("infrastructure", () => {
    const websocketSender = ref<((message: any) => void) | null>(null)

    // State
    const capabilities = ref<Map<string, Capability>>(new Map)
    const zones = ref<Map<string, Zone>>(new Map)
    const servers = ref<Map<string, Server>>(new Map)
    const capabilityZoneRelations = ref<Set<string>>(new Set)

    // Connection to server store
    const isLoading = ref(true)
    const isConnected = ref(false)

    // Lookup tables
    const serversByZone = ref<Map<string, Set<string>>>(new Map())
    const zonesByCapability = ref<Map<string, Set<string>>>(new Map())
    const capabilitiesByZone = ref<Map<string, Set<string>>>(new Map())
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

    // Capability zone relationship helpers
    const addCapabilityZoneRelation = (capabilityId: string, zoneId: string) => {
        const relationKey = `${capabilityId}::${zoneId}`
        capabilityZoneRelations.value.add(relationKey)

        addToIndex(zonesByCapability.value, capabilityId, zoneId)
        addToIndex(capabilitiesByZone.value, zoneId, capabilityId)
    }
    const removeCapabilityZoneRelation = (capabilityId: string, zoneId: string) => {
        const relationKey = `${capabilityId}::${zoneId}`
        capabilityZoneRelations.value.delete(relationKey)

        removeFromIndex(zonesByCapability.value, capabilityId, zoneId)
        removeFromIndex(capabilitiesByZone.value, zoneId, capabilityId)
    }

    const rebuildIndexes = () => {
        serversByZone.value.clear()
        zonesByCapability.value.clear()
        serversByStatus.value.clear()
        capabilitiesByStatus.value.clear()
        capabilitiesByZone.value.clear()
        zoneHealthCache.value.clear()

        // Server indexes
        for (const server of servers.value.values()) {
            addToIndex(serversByZone.value, server.zoneId, server.id)
            addToIndex(serversByStatus.value, server.status, server.id)
        }

        // Zone and capability relationship indexes
        for (const relationKey of capabilityZoneRelations.value) {
            const [capabilityId, zoneId] = relationKey.split("::")
            addToIndex(zonesByCapability.value, capabilityId, zoneId)
            addToIndex(capabilitiesByZone.value, zoneId, capabilityId)
        }

        // Capability indexes
        for (const capability of capabilities.value.values()) {
            addToIndex(capabilitiesByStatus.value, capability.status, capability.id)
        }
    }

    // Initialize state from server data
    const initializeFromServerState = (serverState: InfrastructureState) => {
        console.log("Initializing client state from server")

        capabilities.value.clear()
        zones.value.clear()
        servers.value.clear()
        capabilityZoneRelations.value.clear()

        // Convert date string and populate state 
        serverState.capabilities.forEach(capability => {
            capabilities.value.set(capability.id, {
                ...capability,
                lastUpdated: new Date(capability.lastUpdated)
            })
        })
        serverState.zones.forEach(zone => {
            zones.value.set(zone.id, {
                ...zone,
                lastUpdated: new Date(zone.lastUpdated)
            })
        })
        serverState.servers.forEach(server => {
            servers.value.set(server.id, {
                ...server,
                lastUpdated: new Date(server.lastUpdated)
            })
        })
        serverState.capabilityZoneRelations.forEach(relation => {
            addCapabilityZoneRelation(relation.capabilityId, relation.zoneId)
        })

        rebuildIndexes()
        isLoading.value = false
        console.log("Client state successfully initialized!")
    }

    // Websocket functions
    const setWebSocketSender = (sender: (message: any) => void) => {
        websocketSender.value = sender
    }

    const setConnectionStatus = (connected: boolean) => {
        isConnected.value = connected
        if (!connected) {
            isLoading.value = true
        }
    }

    const broadcastStatusUpdate = (update: StatusUpdate) => {
        if (websocketSender.value) {
            websocketSender.value({
                type: "status_update",
                payload: update
            })
        }
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
    const getCapabilitiesByZone = (zoneId: string): Capability[] => {
        const capabilityIds = capabilitiesByZone.value.get(zoneId) || new Set()
        return Array.from(capabilityIds).map(id => capabilities.value.get(id)!).filter(Boolean)
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

    // Internal actions
    const updateCapabilityStatusInternal = (update: StatusUpdate) => {
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
    const updateServerStatusInternal = (update: StatusUpdate) => {
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

    // Public actions using websocket
    // TODO make internal update more robust depending on websocket success / failure
    const updateCapabilityStatus = (update: StatusUpdate) => {
        updateCapabilityStatusInternal(update)
        broadcastStatusUpdate(update)
    }
    const updateServerStatus = (update: StatusUpdate) => {
        updateServerStatusInternal(update)
        broadcastStatusUpdate(update)
    }
    const handleIncomingStatusUpdate = (update: StatusUpdate) => {
        console.log("Received status update from websocket:", update)

        if (update.type === "Capability") {
            updateCapabilityStatusInternal(update)
        } else if (update.type === "Server") {
            updateServerStatusInternal(update)
        }
    }

    return {
        // State
        capabilities,
        zones,
        servers,
        isLoading,
        isConnected,

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
        getCapabilitiesByZone,

        // Status filters
        healthyCapabilities,
        compromisedCapabilities,
        unknownCapabilities,
        healthyServers,
        compromisedServers,
        unknownServers,

        // Health calculation
        getZoneHealth,

        // Websocket
        setWebSocketSender,
        handleIncomingStatusUpdate,
        initializeFromServerState,
        setConnectionStatus,

        // Actions
        updateCapabilityStatus,
        updateServerStatus,
        rebuildIndexes
    }
})
