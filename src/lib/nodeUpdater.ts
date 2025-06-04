import { createElement } from '../element';
import { cssKey, cssTextToObject } from './helper';
import { NodeItem } from '../types/nodeTree';
import { cssValue, isEventKey, isFragment, isFunction, isText } from './helper';
import { current } from 'immer';

export function updateDomAttributes(newNode: NodeItem, oldNode: NodeItem) {
    // 合并属性更新逻辑
    const element = oldNode.element;
    if (!element) {
        throw new Error('updateDomAttributes: element not found');
    }
    if (isFragment(element) || isText(element)) {
        return;
    }
    if (newNode.component?._id) {
        element.setAttribute('node-id', newNode.component._id);
    }
    const attributes = element.attributes || [];
    const newAttributes = newNode.attributes || {};
    const newKeys = Object.keys(newAttributes);
    Array.from(attributes).forEach((attr) => {
        const key = attr.name;
        const value = attr.value;
        if (!newKeys.includes(key)) {
            element.removeAttribute(key);
            return;
        }

        if (isEventKey(key) && isFunction(value)) {
            const eventType = key.toLowerCase().substring(2);
            // 检查 value 是否为有效的 EventListener 类型
            if (typeof value === 'function') {
                const newCallback = value as unknown as (evt: Event) => void;
                if (
                    oldNode.__eventHandlers &&
                    oldNode.__eventHandlers[eventType]
                ) {
                    element.removeEventListener(
                        eventType,
                        oldNode.__eventHandlers[eventType]
                    );
                }
                element.addEventListener(eventType, newCallback);
                if (!newNode.__eventHandlers) newNode.__eventHandlers = {};
                newNode.__eventHandlers[eventType] = newCallback;
            } else {
                console.error(`事件处理程序 ${key} 不是有效的函数类型`);
            }
            return;
        }
        if (key === 'style') {
            const newStyle = newAttributes[key] as
                | Record<string, string | number>
                | undefined;
            let currentStyle = cssTextToObject(
                element.getAttribute('style') || ''
            );
            Object.keys(currentStyle).forEach((styleKey) => {
                if (!newStyle || !newStyle.hasOwnProperty(styleKey)) {
                    element.style.removeProperty(cssKey(styleKey)); // cssKey for safety
                }
            });
            if (newStyle && typeof newStyle === 'object') {
                Object.entries(newStyle).forEach(([styleKey, value]) => {
                    element.style.setProperty(cssKey(styleKey), cssValue(value));
                });
            }
            return;
        }
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            element.setAttribute(key, String(value));
        }
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
