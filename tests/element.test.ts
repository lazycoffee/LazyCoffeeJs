import { expect, test, describe, beforeEach, mock, spyOn } from 'bun:test';
import {
    createElement,
    createElementTree,
    removeNodeElement,
} from '../src/element';
import { NodeItem } from '../src/types/nodeTree';
import { init } from './lib/common';
init();
describe('createElement(node: NodeItem)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should throw error if node is null or undefined', () => {
        expect(() => createElement(null as any)).toThrow(
            'create element failed. invalid node'
        );
        expect(() => createElement(undefined as any)).toThrow(
            'create element failed. invalid node'
        );
    });

    test('should create a simple HTML element (div) and set basic attributes', () => {
        const node: NodeItem = {
            tag: 'div',
            attributes: { id: 'test-id' },
            props: {},
            children: [],
        };
        const element = createElement(node) as HTMLElement;
        expect(element.tagName).toBe('DIV');
        expect(element.id).toBe('test-id');
        expect(node.element).toBe(element);
    });

    test('should create a text node', () => {
        const node: NodeItem = {
            tag: 'text',
            text: 'Hello world',
            props: {},
            children: [],
            attributes: {},
        };
        const textNode = createElement(node);

        expect(textNode.nodeValue).toBe('Hello world');
        expect(node.element).toBe(textNode);
    });

    test('should create a DocumentFragment when node.tag is "fragment"', () => {
        const node: NodeItem = {
            tag: 'fragment',
            props: {},
            children: [],
            attributes: {},
        };
        const fragment = createElement(node);

        expect(fragment.nodeType).toBe(11); // Node.DOCUMENT_FRAGMENT_NODE
        expect(node.element).toBe(fragment);
    });

    test('should set className from props as class attribute', () => {
        const node: NodeItem = {
            tag: 'p',
            props: { className: 'test-class' },
            children: [],
            attributes: {},
        };
        const element = createElement(node) as HTMLParagraphElement;
        expect(element.className).toBe('test-class');
    });

    test('should apply style objects from props correctly', () => {
        const node: NodeItem = {
            tag: 'div',
            props: { style: { color: 'red', backgroundColor: 'blue' } },
            children: [],
            attributes: {},
        };
        const element = createElement(node) as HTMLElement;
        expect(element.style.color).toBe('red');
        expect(element.style.backgroundColor).toBe('blue');
    });

    test('should attach event handlers from props', () => {
        const handleClick = mock(() => {});
        const node: NodeItem = {
            tag: 'button',
            props: { onClick: handleClick },
            children: [],
            attributes: {},
        };
        const element = createElement(node);
        element.dispatchEvent(new Event('click'));
        expect(handleClick).toHaveBeenCalled();
    });

    test('should set input checked attribute from props if value is true', () => {
        const node: NodeItem = {
            tag: 'input',
            props: { type: 'checkbox', checked: true },
            children: [],
            attributes: {},
        };
        const element = createElement(node) as HTMLInputElement;
        expect(element.checked).toBe(true);
    });

    test('should set node-id attribute if node.component._id exists', () => {
        const componentId = 'comp-123';
        const node: NodeItem = {
            tag: 'div',
            props: {},
            component: { _id: componentId } as any,
            children: [],
            attributes: {},
        };
        const element = createElement(node) as HTMLElement;
        expect(element.getAttribute('node-id')).toBe(componentId);
    });
});

describe('createElementTree(jsxNode: NodeItem)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should throw error if jsxNode is null or undefined', () => {
        expect(() => createElementTree(null as any)).toThrow(
            'create element failed. invalid node'
        );
        expect(() => createElementTree(undefined as any)).toThrow(
            'create element failed. invalid node'
        );
    });

    test('should create a simple tree (div with span child) and append', () => {
        const childNode: NodeItem = {
            tag: 'span',
            props: {},
            children: [],
            attributes: {},
        };
        const parentNode: NodeItem = {
            tag: 'div',
            props: {},
            children: [childNode],
            attributes: {},
        };
        const parentElement = createElementTree(parentNode) as HTMLDivElement;

        expect(parentElement.tagName.toUpperCase()).toEqual('DIV');
        expect(parentElement.children[0].tagName.toUpperCase()).toEqual('SPAN');
    });

    test('should recursively create and append children', () => {
        const grandChildNode: NodeItem = {
            tag: 'i',
            props: {},
            children: [],
            attributes: {},
        };
        const childNode: NodeItem = {
            tag: 'span',
            props: {},
            children: [grandChildNode],
            attributes: {},
        };
        const parentNode: NodeItem = {
            tag: 'div',
            props: {},
            children: [childNode],
            attributes: {},
        };

        createElementTree(parentNode);

        expect(
            (parentNode.element as HTMLElement).tagName.toUpperCase()
        ).toEqual('DIV');
        expect(
            (childNode.element as HTMLElement).tagName.toUpperCase()
        ).toEqual('SPAN');
        expect(
            (grandChildNode.element as HTMLElement).tagName.toUpperCase()
        ).toEqual('I');

        expect(grandChildNode.parent).toBe(childNode);
        expect(childNode.parent).toBe(parentNode);
    });
});

describe('removeNodeElement(element: NodeElement)', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('should call element.remove() for a simple HTML element', () => {
        const mockElement = document.createElement('div');
        spyOn(mockElement, 'remove');
        removeNodeElement(mockElement);
        expect(mockElement.remove).toHaveBeenCalledTimes(1);
    });

    test('should recursively call remove for DocumentFragment children', () => {
        const fragment = document.createDocumentFragment();
        const child1 = document.createElement('span');
        const child2 = document.createElement('p');
        spyOn(child1, 'remove');
        spyOn(child2, 'remove');
        fragment.appendChild(child1);
        fragment.appendChild(child2);

        removeNodeElement(fragment); // This will call remove on child1 and child2
        expect(child1.remove).toHaveBeenCalledTimes(1);
        expect(child2.remove).toHaveBeenCalledTimes(1);
    });
});
