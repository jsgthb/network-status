import { parse as parseYaml } from "yaml"
import {
    Capability,
    Zone,
    Server,
    CapabilityZoneRelation,
    InfrastructureState,
    Status
} from "~/types/infrastructureTypes"

export interface YAMLInfrastructureConfig {
    metadata: {
        name: string
        version: string
        description: string
    }
    zones: {
        [zoneKey: string]: {
            name: string
            description: string
            servers: Array<{
                name: string
                os: string
                ipv4: Array<string>
                ipv6: Array<string>
            }>
        }
    }
    capabilities: {
        [capKey: string]: {
            name: string
            description: string
            zones: string[]
        }
    }
}

export class YAMLConfigParser {
    private generateId(prefix: string, name: string): string {
        return `${prefix}-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    }

    private generateServerId(zoneName: string, serverName: string): string {
        const ZONE_PREFIX_LENGTH = 3
        const zonePrefix = zoneName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").substring(0, ZONE_PREFIX_LENGTH)
        const serverPrefix = serverName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        return `server-${zonePrefix}-${serverPrefix}`
    }

    public parseYAMLtoConfig(yamlContent: string): YAMLInfrastructureConfig {
        try {
            const config: YAMLInfrastructureConfig = parseYaml(yamlContent)

            if (!config) {
                throw new Error("YAML content is empty or invalid")
            }

            return config
        } catch (error) {
            throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown parsing error'}`)
        }
    }

    public transformConfigToState(config: YAMLInfrastructureConfig): InfrastructureState {
        const capabilities: Capability[] = []
        const zones: Zone[] = []
        const servers: Server[] = []
        const capabilityZoneRelations: CapabilityZoneRelation[] = []
        const now = new Date()

        // Process zones and associated servers
        for (const [zoneKey, zoneData] of Object.entries(config.zones)) {
            const zoneId = this.generateId("zone", zoneKey)

            // Create zone
            const zone: Zone = {
                id: zoneId,
                name: zoneData.name,
                lastUpdated: now
            }
            zones.push(zone)

            // Add servers to zone
            if (!zoneData.servers) {
                console.warn(`Zone "${zoneKey}" has no servers, skipping`)
                continue
            }
            for (const serverData of zoneData.servers) {
                const serverId = this.generateServerId(zoneKey, serverData.name)

                const server: Server = {
                    id: serverId,
                    name: serverData.name,
                    status: Status.Green,
                    zoneId: zoneId,
                    lastUpdated: now,
                    description: {
                        os: serverData.os,
                        ipv4: serverData.ipv4,
                        ipv6: serverData.ipv6
                    }
                }
                servers.push(server)
            }
        }

        // Process capabilities and zone relationships
        for (const [capKey, capData] of Object.entries(config.capabilities)) {
            const capabilityId = this.generateId("cap", capKey)

            // Create capability
            const capability: Capability = {
                id: capabilityId,
                name: capData.name,
                status: Status.Green,
                lastUpdated: now
            }
            capabilities.push(capability)

            // Create capability zone relationships
            if (!capData.zones) {
                console.warn(`Capability "${capKey}" has no zones assigned, skipping`)
                continue
            }
            for (const zoneName of capData.zones) {
                const zoneId = this.generateId("zone", zoneName)

                // Verify zone exists
                if (zones.find(z => z.id === zoneId)) {
                    capabilityZoneRelations.push({
                        capabilityId,
                        zoneId
                    })
                } else {
                    console.warn(`Zone "${zoneName}" referenced in capability "${capKey}" not found`)
                }
            }
        }

        return {
            capabilities,
            zones,
            servers,
            capabilityZoneRelations
        }
    }

    public validateConfig(config: YAMLInfrastructureConfig): string[] {
        const errors: string[] = []

        // Check metadata
        if (!config.metadata?.name) {
            errors.push("Missing metadata name")
        }

        // Validate zones
        errors.push(...this.validateZones(config.zones))

        // Validate capabilities
        errors.push(...this.validateCapabilities(config.capabilities, config.zones))

        return errors
    }

    private validateZones(zones: YAMLInfrastructureConfig["zones"]): string[] {
        const errors: string[] = []

        if (!zones || Object.keys(zones).length === 0) {
            errors.push("No zones defined")
            return errors
        }

        for (const [zoneKey, zoneData] of Object.entries(zones)) {
            if (!zoneData.name) {
                errors.push(`Zone "${zoneKey}" missing name`)
            }

            if (!zoneData.servers || zoneData.servers.length === 0) {
                errors.push(`Zone "${zoneKey}" has no servers`)
                continue
            }

            for (const server of zoneData.servers) {
                if (!server.name) {
                    errors.push(`Server in zone "${zoneKey}" missing name`)
                }
                if (!server.os) {
                    errors.push(`Server "${server.name}" in zone "${zoneKey}" missing OS`)
                }
                if (!server.ipv4) {
                    errors.push(`Server "${server.name}" in zone "${zoneKey}" missing IPv4 address array`)
                }
                if (!server.ipv6) {
                    errors.push(`Server "${server.name}" in zone "${zoneKey}" missing IPv6 address array`)
                }
            }
        }

        return errors
    }

    private validateCapabilities(capabilities: YAMLInfrastructureConfig["capabilities"], zones: YAMLInfrastructureConfig["zones"]): string[] {
        const errors: string[] = []

        if (!capabilities || Object.keys(capabilities).length === 0) {
            errors.push("No capabilities defined")
            return errors
        }

        const availableZones = Object.keys(zones || {})

        for (const [capKey, capData] of Object.entries(capabilities)) {
            if (!capData.name) {
                errors.push(`Capability "${capKey}" missing name`)
            }

            if (!capData.zones || capData.zones.length === 0) {
                errors.push(`Capability "${capKey}" has no zones assigned`)
                continue
            }

            for (const zoneName of capData.zones) {
                if (!availableZones.includes(zoneName)) {
                    errors.push(`Capability "${capKey}" references unknown zone "${zoneName}"`)
                }
            }
        }

        return errors
    }
}