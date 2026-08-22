<script setup>
import { ref, watch } from 'vue';
import { FieldCaption, Popover } from '@aaix/laravel-islands/vue/helpers';
import FieldSegment from './FieldSegment.vue';
import InlineEdit from './InlineEdit.vue';

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String, Object], default: null },
    display: { type: String, default: '' },
    type: { type: String, default: 'integer' },
    parts: { type: Array, default: null },
    separator: { type: String, default: '' },
    suffix: { type: String, default: '' },
    saving: { type: Boolean, default: false },
    error: { type: String, default: '' },
});

const emit = defineEmits(['save']);

const open = ref(false);
const trigger = ref(null);


function toggle() {
    open.value = !open.value;
}

// A finished write closes the editor; a rejected one keeps it open with the message.
watch(
    () => props.saving,
    (isSaving, wasSaving) => {
        if (wasSaving && !isSaving && !props.error) {
            open.value = false;
        }
    },
);


</script>

<template>
    <div ref="trigger" @click.stop="toggle()">
        <FieldSegment
            :label="label"
            :value="value === null ? null : (display || value)"
            :saving="saving"
            interactive
            affordance="edit"
        />

        <Popover :anchor="trigger" :open="open" :width="260" @close="open = false">
            <div class="p-3">
                <p class="mb-2"><FieldCaption>{{ label }}</FieldCaption></p>

                <InlineEdit
                    :key="String(open)"
                    :value="value"
                    :type="type"
                    v-bind="parts ? { parts, separator } : {}"
                    :suffix="suffix"
                    :label="label"
                    :saving="saving"
                    :error="error"
                    auto-start
                    @save="emit('save', $event)"
                    @cancel="open = false"
                />
            </div>
        </Popover>
    </div>
</template>
