import {atom} from 'recoil';
export const score= atom<number>({
    key: 'score',
    default: 0
});