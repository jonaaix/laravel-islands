<script setup>
import { watch } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps({
    modelValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
    content: props.modelValue,
    extensions: [StarterKit],
    editorProps: {
        attributes: {
            class: 'min-h-[8rem] px-3 py-2 text-sm focus:outline-none',
        },
    },
    onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        emit('update:modelValue', html === '<p></p>' ? '' : html);
    },
});

watch(
    () => props.modelValue,
    (value) => {
        if (editor.value && value !== editor.value.getHTML()) {
            editor.value.commands.setContent(value || '', false);
        }
    },
);

const TOOLS = [
    { key: 'bold', label: 'B', class: 'font-bold', run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive('bold') },
    { key: 'italic', label: 'I', class: 'italic', run: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive('italic') },
    { key: 'strike', label: 'S', class: 'line-through', run: (e) => e.chain().focus().toggleStrike().run(), active: (e) => e.isActive('strike') },
    { key: 'bulletList', label: '• List', class: '', run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
    { key: 'orderedList', label: '1. List', class: '', run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
];
</script>

<template>
    <div class="wysiwyg overflow-hidden rounded-lg ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-primary-500 dark:ring-gray-600">
        <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-white/10 dark:bg-gray-800">
            <button
                v-for="tool in TOOLS"
                :key="tool.key"
                type="button"
                @click="tool.run(editor)"
                class="rounded px-2 py-1 text-xs transition"
                :class="[
                    tool.class,
                    tool.active(editor)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-200'
                        : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
                ]"
            >
                {{ tool.label }}
            </button>
        </div>
        <EditorContent :editor="editor" class="bg-white text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100" />
    </div>
</template>

<style scoped>
.wysiwyg :deep(.ProseMirror p) {
    margin: 0.25rem 0;
}
.wysiwyg :deep(.ProseMirror ul) {
    list-style: disc;
    padding-left: 1.25rem;
    margin: 0.25rem 0;
}
.wysiwyg :deep(.ProseMirror ol) {
    list-style: decimal;
    padding-left: 1.25rem;
    margin: 0.25rem 0;
}
.wysiwyg :deep(.ProseMirror strong) {
    font-weight: 700;
}
.wysiwyg :deep(.ProseMirror em) {
    font-style: italic;
}
.wysiwyg :deep(.ProseMirror s) {
    text-decoration: line-through;
}
.wysiwyg :deep(.ProseMirror h1) {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0.4rem 0;
}
.wysiwyg :deep(.ProseMirror h2) {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0.4rem 0;
}
</style>
