import { createElement } from '../element';
import { cssKey } from './helper';
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
        const value = attributes[key]; // string | number | boolean | undefined | Record<string, string | number>

        if (isEventKey(key) && isFunction(value)) {
            const eventType = key.toLowerCase().substring(2);
            // 检查 value 是否为有效的 EventListener 类型
if (typeof value === 'function') {
    const newCallback = (value as unknown) as (evt: Event) => void;
    if (oldNode.__eventHandlers && oldNode.__eventHandlers[eventType]) {
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
            const newStyle = newNode.attributes[key] as Record<string, string | number> | undefined;
            const oldStyle = oldNode.attributes[key] as Record<string, string | number> | undefined;

            if (typeof newStyle === 'object' && newStyle !== null) {
                const newStyleKeys = Object.keys(newStyle);
                // Remove styles that are in oldStyle but not in newStyle
                if (typeof oldStyle === 'object' && oldStyle !== null) {
                    Object.keys(oldStyle).forEach(styleKey => {
                        if (!newStyle.hasOwnProperty(styleKey)) {
                            element.style.removeProperty(cssKey(styleKey)); // cssKey for safety
                        }
                    });
                }
                // Apply new/updated styles
                newStyleKeys.forEach(styleKey => {
                    const styleValue = cssValue(String(newStyle[styleKey])); // Ensure string
                    element.style.setProperty(cssKey(styleKey), styleValue); // cssKey for safety
                });
            } else if (typeof oldStyle === 'object' && oldStyle !== null) {
                // New style is not an object (or null/undefined), so remove all old styles
                Object.keys(oldStyle).forEach(styleKey => {
                    element.style.removeProperty(cssKey(styleKey));
                });
            }
            // If newStyle is not an object and oldStyle is also not an object, do nothing for style.
            return;
        }
        // Default: set attribute if it's a primitive type
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            element.setAttribute(key, String(value));
        }
        // If value is undefined (because it was removed from newNode.attributes),
        // it's handled by the initial check: element.removeAttribute(key);
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
