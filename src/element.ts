import { cssKey, cssValue, isFragment, isHTMLElement } from './lib/helper';
import { NodeElement, NodeItem } from './types/nodeTree';

export function createElement(node: NodeItem): NodeElement {
    if (!node) {
        throw new Error('create element failed. invalid node');
    }
    const tag = node.tag;
    let element: NodeElement;
    if (tag === 'fragment') {
        element = document.createDocumentFragment();
    } else if (tag === 'text') {
        element = document.createTextNode(node.text || '');
    } else {
        element = document.createElement(tag);
    }
    node.element = element;
    // set attributes
    const attributes = node.attributes;
    const props = node.props;
    const combinedAttr = { ...props, ...attributes };
    if (node.component?._id) combinedAttr['node-id'] = node.component._id;
    if (!isHTMLElement(element)) {
        return element;
    }
    const htmlElement = node.element as HTMLElement;
    Object.keys(combinedAttr).forEach((key) => {
        const attrValue = combinedAttr[key]; // Type is now unknown | string | number | boolean | undefined

        if (/^on[A-Z]/.test(key) && typeof attrValue === 'function') {
            const eventType = key.substring(2).toLowerCase();
            // Ensure __eventHandlers exists and attrValue is a valid EventListener
            if (!node.__eventHandlers) {
                node.__eventHandlers = {};
            }
            // Remove old listener if it exists and was the same function instance
            if (node.__eventHandlers[eventType]) {
                 htmlElement.removeEventListener(eventType, node.__eventHandlers[eventType]);
            }
            htmlElement.addEventListener(eventType, attrValue as EventListener);
            node.__eventHandlers[eventType] = attrValue as EventListener;
            return;
        }
        if (key === 'style' && typeof attrValue === 'object' && attrValue !== null) {
            Object.keys(attrValue).forEach((styleKey) => {
                // Assuming attrValue is Record<string, string | number> here
                const styleValue = (attrValue as Record<string, string | number>)[styleKey];
                const value = cssValue(String(styleValue)); // Ensure string for cssValue
                htmlElement.style.setProperty(cssKey(styleKey), value);
            });
            return;
        }
        if (htmlElement.tagName.toUpperCase() === 'INPUT' && key === 'checked') {
            if (attrValue) { // attrValue can be true/false or string "true"/"false"
                htmlElement.setAttribute(key, '');
            } else {
                htmlElement.removeAttribute(key); // Also remove if explicitly false
            }
            return;
        }
        if (key === 'className' && (typeof attrValue === 'string' || typeof attrValue === 'number')) {
            htmlElement.setAttribute('class', String(attrValue));
            return;
        }
        if (key === '_id' && (typeof attrValue === 'string' || typeof attrValue === 'number')) {
            htmlElement.setAttribute('id', String(attrValue));
            return;
        }
        // Default setAttribute for other properties
        // Ensure attrValue is suitable for setAttribute (usually string)
        if (typeof attrValue === 'string' || typeof attrValue === 'number' || typeof attrValue === 'boolean') {
            htmlElement.setAttribute(key, String(attrValue));
        }
        // other types of attrValue (objects, arrays not handled above) will be ignored for setAttribute
    });
    return htmlElement;
}
export function createElementTree(jsxNode: NodeItem): NodeElement | undefined { 
    if (!jsxNode) { // Added check for initial jsxNode
        throw new Error('create element failed. invalid node');
    }
    function recursive(nextNode: NodeItem, parentNode: NodeItem | null): NodeElement | undefined { // Added return type for recursive
        // Note: nextNode here will not be null due to the initial check in createElementTree 
        // and the assumption that children arrays don't contain null/undefined items.
        // If children arrays *can* contain falsy values, a check here would be needed.

        // 'string' type check for nextNode is not present in NodeItem type, assuming NodeItem always.
        if (nextNode.tag && parentNode) { // Simplified: typeof nextNode !== 'string' removed as NodeItem is object
            nextNode.parent = parentNode;
        }
        
        const element = createElement(nextNode); // createElement returns NodeElement

        if (nextNode.children) {
            for (const child of nextNode.children) {
                // The result of recursive call for children is not directly used here,
                // as children are appended during their own createElement call if parent element exists.
                // However, the recursive call sets up the parent-child relationship in NodeItem.
                recursive(child, nextNode);
            }
        }

        if (parentNode && parentNode.element && element) { // Ensure element is not undefined
            try {
                parentNode.element.appendChild(element);
            } catch (e) {
                console.error("Error appending child:", element, "to parent:", parentNode.element, e);
                // Potentially handle error, e.g. if element is of a type that cannot be appended.
            }
        }
        return element; // Returns the created element for the current node
    }
    return recursive(jsxNode, null); // Initial call
}
export function removeNodeElement(element: NodeElement) {
    if (isFragment(element)) {
        // Iterate over a shallow copy of childNodes because child.remove() might modify the original array
        Array.from(element.childNodes).forEach((child) => {
            removeNodeElement(child as NodeElement);
        });
        return;
    }
    element.remove();
}
