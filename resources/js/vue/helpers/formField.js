import { computed, inject, provide } from 'vue';

const FORM_FIELD_KEY = Symbol('islands-form-field');

/**
 * Hands the control inside a FormField the id its label points at and the ids of the lines
 * that describe it, so a screen reader reads label, description and error with the control.
 *
 * @param {{ id: string, describedBy: import('vue').ComputedRef<string|undefined>, invalid: import('vue').ComputedRef<boolean> }} field
 */
export function provideFormField(field) {
    provide(FORM_FIELD_KEY, field);
}

/**
 * The attributes a control spreads on its focusable element; empty outside a FormField and
 * never overriding an id the callsite set itself.
 *
 * @param {Record<string, unknown>} attrs
 */
export function useFormFieldAttributes(attrs) {
    const field = inject(FORM_FIELD_KEY, null);

    return computed(() => (field ? {
        id: attrs.id ?? field.id,
        'aria-describedby': attrs['aria-describedby'] ?? field.describedBy.value,
        'aria-invalid': field.invalid.value || undefined,
    } : {}));
}
