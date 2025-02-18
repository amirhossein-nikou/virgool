export function createSlug(str: string): string {
    return str.replace(/[ ً،؛{}><./":;'ءَُِّـ«»\+\-\*.@!#$%^&-_=><()]+/g, " ")?.replace(/[\s]+/g,'-')
}
export const randomValue = () => Math.random().toString(36).substring(2);