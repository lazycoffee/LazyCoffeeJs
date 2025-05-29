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
        const attrValue = combinedAttr[key];
        if (/^on[A-Z]/.test(key) && typeof attrValue === 'function') {
            const eventType = key.substring(2).toLowerCase();
            htmlElement.removeEventListener(
                eventType,
                node.__eventHandlers?.[eventType]
            );
            htmlElement.addEventListener(eventType, attrValue);
            if (!node.__eventHandlers) node.__eventHandlers = {};
            node.__eventHandlers[eventType] = attrValue;
            return;
        }
        if (htmlElement.tagName === 'input' && key === 'checked') {
            if (attrValue) {
                htmlElement.setAttribute(key, '');
            }
            return;
        }
        if (key === 'className') {
            htmlElement.setAttribute('class', attrValue);
            return;
        }
        if (key === '_id') {
            htmlElement.setAttribute('id', attrValue);
            return;
        }
        if (key === 'style') {
            Object.keys(attrValue).forEach((styleKey) => {
                const value = cssValue(attrValue[styleKey]);
                htmlElement.style.setProperty(cssKey(styleKey), value);
            });
            return;
        }
        htmlElement.setAttribute(key, attrValue);
    });
    return htmlElement;
}
export function createElementTree(jsxNode: NodeItem): any {
    console.log('createElementTree: ', jsxNode);
    function recursive(nextNode: NodeItem, parentNode: NodeItem | null) {
        if (!nextNode) {
            throw new Error('invalid node');
        }
        if (typeof nextNode !== 'string' && nextNode.tag && parentNode) {
            nextNode.parent = parentNode;
        }
        let element = createElement(nextNode);
        if (nextNode.children) {
            for (const child of nextNode.children) {
                recursive(child, nextNode);
            }
        }
        if (parentNode && parentNode.element) {
            parentNode.element.appendChild(element);
            return;
        }
        return element;
    }
    return recursive(jsxNode, null);
}
export function removeNodeElement(element: NodeElement) {
    if (isFragment(element)) {
        element.childNodes.forEach((child) => {
            removeNodeElement(child as NodeElement);
        });
        return;
    }
    element.remove();
}
