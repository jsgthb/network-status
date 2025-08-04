<template>
    <div class="p-6 max-w-4xl mx-auto space-y-6">
        <div class="grid grid-cols-3 items-center mb-8">
            <div class="flex justify-start">
                <UButton
                    @click="navigateToInfrastructure"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-arrow-left"
                    color="info"
                >
                    Back
                </UButton>
            </div>
            <h1 class="text-3xl font-bold">Admin Dashboard</h1>
            <div></div> <!-- Empty div for spacing -->
        </div>

        <!-- Upload -->
        <UCard>
            <template #header>
                <h2 class="text-xl font-semibold">Upload Configuation</h2>
            </template>

            <div class="space-y-6">
                <!-- File upload area-->
                <div 
                    class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-gray-400"
                    @dragover.prevent
                    @dragenter.prevent  
                    @dragleave.prevent
                    @drop.prevent="handleDrop"
                >
                    <input
                        ref="fileInput"
                        type="file"
                        accept=".yaml,.yml"
                        @change="handleFileSelect"
                        class="hidden"
                    />

                    <div v-if="!selectedFile" class="space-y-4">
                        <UIcon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 mx-auto text-gray-400"/>
                        <div>
                            <p class="text-lg font-medium">Upload YAML Configuration</p>
                            <p class="text-sm text-gray-600">Click to select or drag and drop your .yaml or .yml file</p>
                        </div>
                        <UButton
                            @click="triggerFileInput"
                            color="info"
                            variant="outline"
                        >
                            Select File
                        </UButton>
                    </div>

                    <div v-else class="space-y-4">
                        <UIcon name="i-heroicons-document-text" class="w-12 h-12 max-auto text-green-500"/>
                        <div>
                            <p class="text-lg font-medium">{{ selectedFile.name }}</p>
                            <p class="text-sm text-gray-600">{{ formatFileSize(selectedFile.size) }}</p>
                        </div>
                        <div class="flex gap-2 justify-center">
                            <UButton
                                @click="uploadFile"
                                :loading="isUploading"
                                :disabled="isUploading"
                                color="primary"
                            >
                                {{ isUploading ? "Uploading" : "Upload Configuration" }}
                            </UButton>
                            <UButton
                                @click="clearFile()"
                                variant="outline"
                                :disabled="isUploading"
                            >
                                Clear
                            </UButton>
                        </div>
                    </div>
                </div>

            </div>
        </UCard>

        <!-- Upload status -->
        <UCard v-if="uploadStatus">
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon
                        :name="uploadStatus.success ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                        :class="uploadStatus.success ? 'text-green-500' : 'text-red-500'"
                        class="w-5 h-5"
                    />
                    <h3 class="text-lg font-semibold">
                        {{ uploadStatus.success ? "Upload Successful" : "Upload Failed" }}
                    </h3>
                </div>
            </template>

            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <p :class="uploadStatus.success ? 'text-green-700' : 'text-red-700'">
                        {{ uploadStatus.message }}
                    </p>
                    <div v-if="uploadStatus.success && uploadStatus.filename" class="text-sm text-gray-600">
                        <span class="font-medium">{{ uploadStatus.filename }}</span>
                    </div>
                </div>

                <!-- Success Summary -->
                <div v-if="uploadStatus.success && uploadStatus.summary" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div class="text-center p-3 rounded-lg border border-gray-800">
                        <div class="text-2xl font-bold">{{ uploadStatus.summary.capabilities }}</div>
                        <div class="text-sm">Capabilities</div>
                    </div>
                    <div class="text-center p-3 rounded-lg border border-gray-800">
                        <div class="text-2xl font-bold">{{ uploadStatus.summary.zones }}</div>
                        <div class="text-sm ">Zones</div>
                    </div>
                    <div class="text-center p-3 rounded-lg border border-gray-800">
                        <div class="text-2xl font-bold ">{{ uploadStatus.summary.servers }}</div>
                        <div class="text-sm ">Servers</div>
                    </div>
                    <div class="text-center p-3 rounded-lg border border-gray-800">
                        <div class="text-2xl font-bold">{{ uploadStatus.summary.relationships }}</div>
                        <div class="text-sm ">Relationships</div>
                    </div>
                </div>

                <!-- Action buttons after upload -->
                <div v-if="uploadStatus.success" class="flex justify-center pt-4">
                    <UButton
                        @click="navigateToInfrastructure"
                        color="primary"
                    >
                        View Infrastructure
                    </UButton>
                </div>
            </div>
        </UCard>

        <!-- Help Section -->
        <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">YAML Configuration Help</h3>
        </template>

        <div class="space-y-4 text-sm">
            <div>
            <h4 class="font-medium mb-2">File Requirements:</h4>
            <ul class="space-y-1 text-gray-600 ml-4">
                <li>• File must have .yaml or .yml extension</li>
                <li>• Must contain valid YAML syntax</li>
                <li>• Should include capabilities, zones, and servers configuration (see README)</li>
            </ul>
            </div>
        </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploadStatus = ref<any>(null)
const isUploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
        if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
            uploadStatus.value = {
                error: true,
                message: "Please select a .yaml or .yml file"
            }
            return
        }

        selectedFile.value = file
        uploadStatus.value = null
    }
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const uploadFile = async () => {
    if (!selectedFile.value) return

    isUploading.value = true
    uploadStatus.value = null

    try {
        const formData = new FormData()
        formData.append("file", selectedFile.value)

        const response = await $fetch("/api/infrastructure/upload", {
            method: "post",
            body: formData
        })

        uploadStatus.value = {
            success: true,
            filename: selectedFile.value.name,
            message: response.message,
            summary: response.summary
        }

        clearFile(true)

    } catch (error: any) {
        console.error("Config upload error", error)

        uploadStatus.value = {
            success: false,
            message: error.data?.message || error.message || "Upload failed"
        }
    } finally {
        isUploading.value = false
    }
}

const clearFile = (keepStatus = false) => {
    selectedFile.value = null
    // Keep outcome status visible
    if (!keepStatus) {
        uploadStatus.value = null
    }
    
    if (fileInput.value) {
        fileInput.value.value = ""
    }
}

const navigateToInfrastructure = () => {
    navigateTo("/")
}

const handleDrop = (event: DragEvent) => {
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
        const file = files[0]
        
        if (!file) return
        
        if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
            selectedFile.value = file
            uploadStatus.value = null
        } else {
            uploadStatus.value = {
                success: false,
                message: 'Please drop a .yaml or .yml file'
            }
         }
    }
}
</script>