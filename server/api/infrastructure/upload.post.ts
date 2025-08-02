import { YAMLConfigParser, YAMLInfrastructureConfig } from "~/../server/utils/yamlConfigParser"
import { infrastructureStore } from "~/../server/utils/infrastructureStore"

export default defineEventHandler(async (event) => {
    try {
        const form = await readMultipartFormData(event)

        if (!form || form.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: "No file provided"
            })
        }

        // Find the YAML file in the form data
        const yamlFile = form.find(item => 
            item.filename?.endsWith('.yaml') || 
            item.filename?.endsWith('.yml')
        )

        if (!yamlFile || !yamlFile.data) {
            throw createError({
                statusCode: 400,
                statusMessage: "YAML configuration file not found. Upload a .yaml or .yml file"
            })
        }

        const yamlContent = yamlFile.data.toString("utf-8")
        if (!yamlContent.trim()) {
            throw createError({
                statusCode: 400,
                statusMessage: "YAML file is empty"
            })
        }

        // Try to parse YAML to check basic structure
        const parser = new YAMLConfigParser()
        let yamlConfig
        try {
            yamlConfig = parser.parseYAMLtoConfig(yamlContent)
        } catch (parseError) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid YAML structure: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`
            })
        }
        
        // Validate the configuration structure
        const validationErrors = parser.validateConfig(yamlConfig)
        if (validationErrors.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: `Configuration validation failed: ${validationErrors.join(", ")}`
            })
        }

        // Transform config to internal state
        let parsedState
        try {
            parsedState = parser.transformConfigToState(yamlConfig)
        } catch (transformError) {
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to transform configuration: ${transformError instanceof Error ? transformError.message : "Unknown transformation error"}`
            })
        }

        // Update the infrastructure store
        console.log("Updating infrastructure store with new configuration...")
        infrastructureStore.replaceState(parsedState)
        
        return {
            success: true,
            message: "Configuration uploaded successfully",
            summary: {
                capabilities: parsedState.capabilities.length,
                zones: parsedState.zones.length,
                servers: parsedState.servers.length,
                relationships: parsedState.capabilityZoneRelations.length
            }
        }

    } catch (error) {
        console.error("Error processing YAML upload:", error)

        // Propagate error if already thrown
        if (error && typeof error === "object" && "statusCode" in error) {
            throw error
        }

        // Generic catch all
        throw createError({
            statusCode: 500,
            statusMessage: `Server error: ${error instanceof Error ? error.message : "Guru Meditation"}`
        })
    }
})