import { atom } from 'recoil';
export const readingWord=atom<string>({
    key: 'readingWord',
    default : 'Holy Cows Are Great'
})