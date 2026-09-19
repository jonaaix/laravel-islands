<script setup>
import Combobox from './Combobox.vue';

defineOptions({ inheritAttrs: false });
</script>

<template>
    <!--
        The picker a form reaches for: the Combobox without its search box, so a short list is
        chosen from rather than typed into. Everything else — variants, clearing, the menu, the
        keyboard — is the Combobox's, which keeps one behaviour behind both names.
        Nothing filters the list here, so it shows every entry unless the caller caps it.
    -->
    <Combobox class="il-select-menu" :max-options="0" v-bind="$attrs" :searchable="false">
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
    </Combobox>
</template>
