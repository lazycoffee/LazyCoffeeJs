import { v4 as uuidV4 } from 'uuid';

export function uuid(): string {
    return uuidV4();
}
export function isFunction(obj: unknown): obj is Function { // obj: any -> unknown
    return typeof obj === 'function';
}
export function isClass(obj: unknown): obj is Function { // obj: any -> unknown
    if (!isFunction(obj)) {
        return false;
    }
    // Assuming obj is a function here due to the check above.
    return /^class\s/.test(Function.prototype.toString.call(obj as Function));
}
export function isFragment(element: unknown): element is DocumentFragment { // element: any -> unknown
    return !!element && (element as Node).nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function isText(element: unknown): element is Text { // element: any -> unknown
    return !!element && (element as Node).nodeType === Node.TEXT_NODE;
}
export function isHTMLElement(element: unknown): element is HTMLElement { // element: any -> unknown
    return element instanceof HTMLElement;
}
export function isHTMLCollection(element: unknown): element is HTMLCollection { // element: any -> unknown
    return element instanceof HTMLCollection;
}
export function cssValue(value: unknown): string { // value: any -> unknown
    if (typeof value === 'number') {
        return `${value}`;
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (!value) {
        return "''";
    }
    return value as string;
}
export function cssKey(key: string): string {
    return key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
export function isEventKey(key: string): boolean {
    return /^on[A-Z]/.test(key);
}
export function removeitemInArray<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
    }
}
