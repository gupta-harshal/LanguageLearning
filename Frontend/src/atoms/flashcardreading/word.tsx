import { atom } from 'recoil';
export const readingWord=atom<string>({
    key: 'readingWord',
    default : '日本語'
})