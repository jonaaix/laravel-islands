export const RADIO_GROUP_KEY = Symbol('aaix.islands.radioGroup');

let sequence = 0;

export function nextRadioGroupName() {
    sequence += 1;

    return `aaix-radio-group-${sequence}`;
}
