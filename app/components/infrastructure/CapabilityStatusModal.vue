<template>
    <UModal 
        v-model:open="isOpen" 
        :ui="{ footer: 'flex justify-end p-4' }"
    >
        <template #header>
            <div class="relative w-full">
                <div>
                    <h2 class="text-lg font-semibold">Set Capability Status</h2>
                    <p class="text-gray-500">{{ capability!.name }}</p>
                </div>
                <div class="absolute top-0 right-0">
                    <UBadge
                        :color="getStatusColor(capability!.status)"
                        variant="subtle"
                        size="lg"
                    >
                        {{ capability?.status }}
                    </UBadge>
                    <div class="text-xs text-gray-400 mt-1 text-right">
                        {{ formatDate(capability!.lastUpdated) }}
                    </div>
                </div>
            </div>
        </template>

        <!-- Status Selection -->
        <template #body>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <label class="font-medium">New Status</label>
                    <div class="flex gap-2">
                        <UBadge
                            :label="StatusCapability.Green"
                            :color="selectedStatus === StatusCapability.Green ? 'success' : 'neutral'"
                            :variant="selectedStatus === StatusCapability.Green ? 'solid' : 'outline'"
                            class="cursor-pointer px-3 py-1"
                            @click="selectedStatus = StatusCapability.Green"
                            size="lg"
                        />
                        <UBadge
                            :label="StatusCapability.Yellow"
                            :color="selectedStatus === StatusCapability.Yellow ? 'warning' : 'neutral'"
                            :variant="selectedStatus === StatusCapability.Yellow  ? 'solid' : 'outline'"
                            class="cursor-pointer px-3 py-1"
                            @click="selectedStatus = StatusCapability.Yellow "
                            size="lg"
                        />
                        <UBadge
                            :label="StatusCapability.Red"
                            :color="selectedStatus === StatusCapability.Red  ? 'error' : 'neutral'"
                            :variant="selectedStatus === StatusCapability.Red ? 'solid' : 'outline'"
                            class="cursor-pointer px-3 py-1"
                            @click="selectedStatus = StatusCapability.Red"
                            size="lg"
                        />
                    </div>
                </div>
                
                <!-- Note Area -->
                <div class="flex items-start justify-between">
                    <label class="font-medium pt-1 pr-13">Note</label>
                    <div class="flex-1 ml-4">
                        <UTextarea
                            v-model="note"
                            placeholder="Enter reason..."
                            :rows="3"
                            size="md"
                            class="w-full"
                        />
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex gap-2 justify-end">
                <UButton
                    color="neutral"
                    variant="outline"
                    label="Cancel"
                    size="md"
                    @click="handleCancel"
                />
                <UButton
                    label="Submit"
                    color="info"
                    size="md"
                    @click="handleSubmit"
                    variant="outline"
                />
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { StatusCapability } from '~/types/infrastructureTypes';
import { useInfrastructureStore } from '#imports';

interface Props {
    modelValue: boolean
    capabilityId: string
}

interface Emits {
    "update:modelValue": [value: boolean]
    "submit": [data: { capabilityId: string, status: StatusCapability, note: string }]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const store = useInfrastructureStore()
const capability = computed(() => store.capabilities.get(props.capabilityId))

// Internal state
const selectedStatus = ref<StatusCapability>(StatusCapability.Green)
const note = ref("")

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value)
})

// Functions
const handleCancel = () => {
    isOpen.value = false
}

const handleSubmit = () => {
    if (!capability.value) return

    emit("submit", {
        capabilityId: props.capabilityId,
        status: selectedStatus.value,
        note: note.value
    })

    isOpen.value = false
}

const getStatusColor = (status: string) => {
    switch (status) {
        case StatusCapability.Green: return "success"
        case StatusCapability.Yellow: return "warning"
        case StatusCapability.Red: return "error"
        default: return "warning"
    }
}

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(date)
}
</script>