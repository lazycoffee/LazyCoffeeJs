import { v4 as uuidV4 } from 'uuid';

export function uuid(): string {
    return uuidV4();
}
export function isFunction(obj: any): obj is Function {
    return typeof obj === 'function';
}
export function isClass(obj: any): obj is Function {
    if (!isFunction(obj)) {
        return false;
    }
    return /^class\s/.test(Function.prototype.toString.call(obj));
}
export function isFragment(element: any): element is DocumentFragment {
    return element.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function isText(element: any): element is Text {
    return element.nodeType === Node.TEXT_NODE;
}
export function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}
export function isHTMLCollection(element: any): element is HTMLCollection {
    return element instanceof HTMLCollection;
}
export function cssValue(value: any): string {
    if (typeof value === 'number') {
        return `${value}`;
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (!value) {
        return "''";
    }
    return value;
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
