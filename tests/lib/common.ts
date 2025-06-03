import { Window, HTMLElement } from 'happy-dom';
export function init() {
    (global as any).window = new Window({ url: 'http://localhost' });
    global.document = window.document;
    (global as any).HTMLElement = HTMLElement;
    (global as any).Node = window.Node;
}
