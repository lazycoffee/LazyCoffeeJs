import { createElement } from '../element';
import { NodeItem } from '../types/nodeTree';
import { cssValue, isEventKey, isFragment, isFunction, isText } from './helper';

export function updateDomAttributes(newNode: NodeItem, oldNode: NodeItem) {
    // 合并属性更新逻辑
    const element = oldNode.element;
    if (!element) {
        console.log('newNode element not found: ', newNode);
        throw new Error('updateDomAttributes: element not found');
    }
    if (isFragment(element) || isText(element)) {
        return;
    }
    if (newNode.component?._id) {
        element.setAttribute('node-id', newNode.component._id);
    }
    const attributes = { ...oldNode.attributes, ...newNode.attributes };
    Object.keys(attributes).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(newNode.attributes, key)) {
            element.removeAttribute(key);
            return;
        }
        const value = attributes[key];
        if (isEventKey(key) && isFunction(value)) {
            // 事件处理更新
            const eventType = key.toLowerCase().substring(2);
            const newCallback = attributes[key];
            if (oldNode.__eventHandlers && oldNode.__eventHandlers[eventType]) {
                element.removeEventListener(
                    eventType,
                    oldNode.__eventHandlers[eventType]
                );
                delete oldNode.__eventHandlers[eventType];
            }
            element.addEventListener(eventType, newCallback);
            return;
        }
        if (key === 'style') {
            const newStyle = newNode.attributes[key];
            const oldStyle = oldNode.attributes[key];
            const newStyleKeys = Object.keys(newStyle);
            const oldStyleKeys = Object.keys(oldStyle);
            const combinedStyleKeys = new Set([
                ...newStyleKeys,
                ...oldStyleKeys,
            ]);
            combinedStyleKeys.forEach((key) => {
                if (!newStyleKeys.includes(key)) {
                    element.style.removeProperty(key);
                    return;
                }
                const value = cssValue(newStyle[key]);
                element.style.setProperty(key, value);
            });
            return;
        }
        element.setAttribute(key, value);
    });
}
export function replaceNode(newNode: NodeItem, oldNode: NodeItem) {
    const newElement = createElement(newNode);
    if (!newElement) {
        throw new Error('updateNode: oldNode.element is null');
    }
    if (!oldNode.element) {
        throw new Error('updateNode: oldNode.element is null');
    }
    const parentElement = oldNode.element.parentElement;
    if (!parentElement) {
        throw new Error('updateNode: parentElement is null');
    }
    parentElement.replaceChild(newElement, oldNode.element);
    oldNode.element = newElement;
}
