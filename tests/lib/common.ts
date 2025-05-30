import { Window } from 'happy-dom';
export function init() {
    (global as any).window = new Window({ url: 'http://localhost' });
    global.document = window.document;
}
