// Step 0: Import test utilities FIRST
import { expect, test, describe, beforeEach, mock } from "bun:test";

// Step 1: Define Mock DOM Classes and assign to Globals
class MinimalMockNode {
    nodeType: number;
    childNodes: MinimalMockNode[] = [];
    ownerDocument: any = null;
    parentElement: MinimalMockElement | null = null;
    appendChild: ReturnType<typeof mock>;
    remove: ReturnType<typeof mock>;

    constructor(nodeType: number) {
        this.nodeType = nodeType;
        this.appendChild = mock((child: MinimalMockNode): MinimalMockNode => {
            child.parentElement = this as unknown as MinimalMockElement;
            this.childNodes.push(child);
            return child;
        });
        this.remove = mock(() => {
            if (this.parentElement && this.parentElement.childNodes) {
                const index = this.parentElement.childNodes.indexOf(this);
                if (index > -1) {
                    this.parentElement.childNodes.splice(index, 1);
                }
            }
        });
    }
}

class MinimalMockElement extends MinimalMockNode {
    tagName: string;
    style: { setProperty: ReturnType<typeof mock> };
    attributes: Record<string, string> = {};
    setAttribute: ReturnType<typeof mock>;
    addEventListener: ReturnType<typeof mock>;
    removeEventListener: ReturnType<typeof mock>;

    constructor(nodeType: number, tagName: string) {
        super(nodeType);
        this.tagName = tagName.toUpperCase();
        this.setAttribute = mock((name: string, value: string) => {
            this.attributes[name] = value;
        });
        this.addEventListener = mock(() => {});
        this.removeEventListener = mock(() => {});
        this.style = { setProperty: mock(() => {}) };
    }
}

class MinimalMockHTMLElement extends MinimalMockElement {
    constructor(tagName: string) {
        super(1, tagName); // Node.ELEMENT_NODE type is 1
    }
}

class MinimalMockText extends MinimalMockNode {
    nodeValue: string = "";
    constructor(text: string) {
        super(3); // Node.TEXT_NODE type is 3
        this.nodeValue = text;
    }
}

class MinimalMockDocumentFragment extends MinimalMockNode {
    constructor() {
        super(11); // Node.DOCUMENT_FRAGMENT_NODE type is 11
    }
}

// Assign to globals *before* importing element.ts
(globalThis as any).Node = MinimalMockNode; 
(globalThis as any).Element = MinimalMockElement; 
(globalThis as any).HTMLElement = MinimalMockHTMLElement; 
(globalThis as any).Text = MinimalMockText; 
(globalThis as any).DocumentFragment = MinimalMockDocumentFragment; 

// Step 2: Define the global 'document' mock
const mockedDocument = {
    createElement: mock((tag: string): MinimalMockHTMLElement => {
        const el = new MinimalMockHTMLElement(tag);
        el.ownerDocument = mockedDocument;
        return el;
    }),
    createTextNode: mock((text: string): MinimalMockText => {
        const tn = new MinimalMockText(text);
        tn.ownerDocument = mockedDocument;
        return tn;
    }),
    createDocumentFragment: mock((): MinimalMockDocumentFragment => {
        const df = new MinimalMockDocumentFragment();
        df.ownerDocument = mockedDocument;
        return df;
    }),
};
(globalThis as any).document = mockedDocument;

// Step 3: Import the module under test
import { createElement, createElementTree, removeNodeElement } from './element';
import { NodeItem, NodeElement } from './types/nodeTree';

describe('createElement(node: NodeItem)', () => {
    beforeEach(() => {
        mockedDocument.createElement.mockClear();
        mockedDocument.createTextNode.mockClear();
        mockedDocument.createDocumentFragment.mockClear();
        // Instance mocks are part of fresh instances, so no global clearing needed for them
    });

    test('should throw error if node is null or undefined', () => {
        expect(() => createElement(null as any)).toThrow('create element failed. invalid node');
        expect(() => createElement(undefined as any)).toThrow('create element failed. invalid node');
    });

    test('should create a simple HTML element (div) and set basic attributes', () => {
        const node: NodeItem = { tag: 'div', attributes: { id: 'test-id' }, props: {} };
        const element = createElement(node) as MinimalMockHTMLElement;

        expect(mockedDocument.createElement).toHaveBeenCalledWith('div');
        expect(element.tagName).toBe('DIV');
        expect(element.setAttribute).toHaveBeenCalledWith('id', 'test-id');
        expect(node.element).toBe(element);
    });

    test('should create a text node', () => {
        const node: NodeItem = { tag: 'text', text: 'Hello world', props: {} };
        const textNode = createElement(node) as MinimalMockText;

        expect(mockedDocument.createTextNode).toHaveBeenCalledWith('Hello world');
        expect(textNode.nodeValue).toBe('Hello world');
        expect(node.element).toBe(textNode);
    });

    test('should create a DocumentFragment when node.tag is "fragment"', () => {
        const node: NodeItem = { tag: 'fragment', props: {} };
        const fragment = createElement(node) as MinimalMockDocumentFragment;

        expect(mockedDocument.createDocumentFragment).toHaveBeenCalled();
        expect(fragment.nodeType).toBe(11); // Node.DOCUMENT_FRAGMENT_NODE
        expect(node.element).toBe(fragment);
    });
    
    test('should set className from props as class attribute', () => {
        const node: NodeItem = { tag: 'p', props: { className: 'test-class' } };
        const element = createElement(node) as MinimalMockHTMLElement;
        expect(element.setAttribute).toHaveBeenCalledWith('class', 'test-class');
    });

    test('should apply style objects from props correctly', () => {
        const node: NodeItem = {
            tag: 'div',
            props: { style: { color: 'red', backgroundColor: 'blue' } },
        };
        const element = createElement(node) as MinimalMockHTMLElement;
        expect(element.style.setProperty).toHaveBeenCalledWith('color', 'red');
        expect(element.style.setProperty).toHaveBeenCalledWith('background-color', 'blue');
    });

    test('should attach event handlers from props', () => {
        const handleClick = mock(() => {});
        const node: NodeItem = { tag: 'button', props: { onClick: handleClick } };
        const element = createElement(node) as MinimalMockHTMLElement;
        expect(element.addEventListener).toHaveBeenCalledWith('click', handleClick);
        expect(node.__eventHandlers?.click).toBe(handleClick);
    });
    
    test('should set input checked attribute from props if value is true', () => {
        const node: NodeItem = { tag: 'input', props: { type: 'checkbox', checked: true } };
        const element = createElement(node) as MinimalMockHTMLElement;
        expect(element.setAttribute).toHaveBeenCalledWith('checked', '');
    });

    test('should set node-id attribute if node.component._id exists', () => {
        const componentId = 'comp-123';
        const node: NodeItem = {
            tag: 'div',
            props: {},
            component: { _id: componentId } as any,
        };
        const element = createElement(node) as MinimalMockHTMLElement;
        expect(element.setAttribute).toHaveBeenCalledWith('node-id', componentId);
    });
});

describe('createElementTree(jsxNode: NodeItem)', () => {
    beforeEach(() => {
        mockedDocument.createElement.mockClear();
        mockedDocument.createTextNode.mockClear();
        mockedDocument.createDocumentFragment.mockClear();
    });

    test('should throw error if jsxNode is null or undefined', () => {
         expect(() => createElementTree(null as any)).toThrow('create element failed. invalid node');
         expect(() => createElementTree(undefined as any)).toThrow('create element failed. invalid node');
    });

    test('should create a simple tree (div with span child) and append', () => {
        const childNode: NodeItem = { tag: 'span', props: {} };
        const parentNode: NodeItem = { tag: 'div', props: {}, children: [childNode] };
        const parentElement = createElementTree(parentNode) as MinimalMockHTMLElement;

        expect(mockedDocument.createElement).toHaveBeenCalledWith('div');
        expect(mockedDocument.createElement).toHaveBeenCalledWith('span');
        expect(parentElement.tagName).toBe('DIV');
        expect(parentElement.appendChild).toHaveBeenCalledTimes(1); // Child appended to parent
        const childElement = (parentElement.appendChild as ReturnType<typeof mock>).mock.calls[0][0];
        expect(childElement.tagName).toBe('SPAN');
        expect(node.element).toBe(parentElement); // Check if parentNode.element is set
        expect(childNode.element).toBe(childElement); // Check if childNode.element is set
        expect(childNode.parent).toBe(parentNode);
    });

    test('should recursively create and append children', () => {
        const grandChildNode: NodeItem = { tag: 'i', props: {} };
        const childNode: NodeItem = { tag: 'span', props: {}, children: [grandChildNode] };
        const parentNode: NodeItem = { tag: 'div', props: {}, children: [childNode] };
        
        createElementTree(parentNode);

        expect(mockedDocument.createElement).toHaveBeenCalledWith('div');
        expect(mockedDocument.createElement).toHaveBeenCalledWith('span');
        expect(mockedDocument.createElement).toHaveBeenCalledWith('i');
        
        const divElement = parentNode.element as MinimalMockHTMLElement;
        const spanElement = childNode.element as MinimalMockHTMLElement;

        expect(divElement.appendChild).toHaveBeenCalledTimes(1);
        expect(spanElement.appendChild).toHaveBeenCalledTimes(1);
        expect(grandChildNode.parent).toBe(childNode);
        expect(childNode.parent).toBe(parentNode);
    });
});

describe('removeNodeElement(element: NodeElement)', () => {
    beforeEach(() => {
        mockedDocument.createElement.mockClear();
        mockedDocument.createTextNode.mockClear();
        mockedDocument.createDocumentFragment.mockClear();
    });

    test('should call element.remove() for a simple HTML element', () => {
        const mockElement = mockedDocument.createElement('div'); 
        removeNodeElement(mockElement);
        expect(mockElement.remove).toHaveBeenCalledTimes(1);
    });

    test('should recursively call remove for DocumentFragment children', () => {
        const fragment = mockedDocument.createDocumentFragment(); 
        const child1 = mockedDocument.createElement('span'); 
        const child2 = mockedDocument.createElement('p');  

        fragment.appendChild(child1); 
        fragment.appendChild(child2);

        removeNodeElement(fragment); // This will call remove on child1 and child2
        expect(child1.remove).toHaveBeenCalledTimes(1); 
        expect(child2.remove).toHaveBeenCalledTimes(1); 
    });
});
