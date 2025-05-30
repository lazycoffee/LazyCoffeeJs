import { expect, test, describe, beforeEach, mock, Mock } from 'bun:test';
import { Component } from '../src/component';
import { NodeItem } from '../src/types/nodeTree';
import { init } from './lib/common';

init();

// Mock dependencies
const mockGetNodeById = mock((node: NodeItem) => node);
const mockCreateElement = mock(() => ({} as HTMLElement)); // Ensure it returns a mock element
const mockCreateElementTree = mock(() => {});
const mockRemoveNodeElement = mock(() => {});
const mockReplaceNode = mock(() => {});
const mockUpdateDomAttributes = mock(() => {});

mock.module('../src/nodeTree', () => ({
    getNodeById: mockGetNodeById,
}));
mock.module('../src/element', () => ({
    createElement: mockCreateElement,
    createElementTree: mockCreateElementTree,
    removeNodeElement: mockRemoveNodeElement,
}));
mock.module('../src/lib/nodeUpdater', () => ({
    replaceNode: mockReplaceNode,
    updateDomAttributes: mockUpdateDomAttributes,
}));

describe('Component', () => {
    let component: Component<{ count: number; message?: string }>;
    let componentRenderMock: Mock<any>;

    beforeEach(() => {
        // Reset mocks before each test
        mockGetNodeById.mockReset();
        mockCreateElement.mockReset();
        mockCreateElementTree.mockReset();
        mockRemoveNodeElement.mockReset();
        mockReplaceNode.mockReset();
        mockUpdateDomAttributes.mockReset();

        // Initialize a new component for each test
        component = new Component();
        component.state = { count: 0, message: '' };

        // Mock a basic render function for testing updateNode
        componentRenderMock = mock(
            () =>
                ({
                    tag: 'div',
                    props: {},
                    children: [],
                    attributes: {},
                } as NodeItem)
        );
        component.render = componentRenderMock;

        // Mock that the node exists for updateNode to proceed
        mockGetNodeById.mockReturnValue({
            tag: 'div',
            props: {},
            children: [],
            component: component,
            attributes: {},
            element: document.createElement('div'),
        });

        // Ensure createElement returns a basic mocked element for updateNode logic
        mockCreateElement.mockReturnValue({} as HTMLElement);
    });

    test('should initialize with an empty state object by default', () => {
        expect(component.state).toEqual({ message: '', count: 0 });
    });

    test('setState should update the state and call render (via updateNode)', () => {
        component.setState({ count: 1 });
        expect(component.state.count).toBe(1);
        expect(componentRenderMock).toHaveBeenCalled();
    });

    test('updateState should update the state using the updater function and call render (via updateNode)', () => {
        // Set initial state first
        component.setState({ count: 5 });
        // Reset render mock count after initial setState
        componentRenderMock.mockClear();

        component.updateState((draft) => {
            draft.count += 1;
        });
        expect(component.state.count).toBe(6);
        expect(componentRenderMock).toHaveBeenCalledTimes(1); // Should be called once for updateState
    });

    test('updateNode should call getNodeById and component.render', () => {
        // Reset mocks that might have been called during setup
        componentRenderMock.mockClear();
        mockGetNodeById.mockClear();

        component.setState({ message: 'hello' }); // This will trigger updateNode

        expect(mockGetNodeById).toHaveBeenCalledWith(component._id);
        expect(componentRenderMock).toHaveBeenCalled();
    });

    test('updateNode should call updateDomAttributes if tag is the same', () => {
        mockUpdateDomAttributes.mockClear();
        mockReplaceNode.mockClear();

        // Ensure the mocked render returns a node with the same tag as initial
        component.render = mock(
            () =>
                ({
                    tag: 'div',
                    props: { newProp: 'value' },
                    children: [],
                    attributes: {},
                } as NodeItem)
        );

        component.setState({ count: 123 }); // Trigger updateNode

        expect(mockUpdateDomAttributes).toHaveBeenCalled();
        expect(mockReplaceNode).not.toHaveBeenCalled();
    });

    test('updateNode should call replaceNode if tag is different', () => {
        mockReplaceNode.mockClear();
        mockUpdateDomAttributes.mockClear();

        // Mock getNodeById to return a node with a specific tag, e.g., 'span'
        // This simulates the "old" node having a different tag
        mockGetNodeById.mockReturnValue({
            tag: 'span', // Old tag
            props: {},
            children: [],
            attributes: {},
            component: component,
            element: {} as HTMLElement,
        });

        // Ensure the mocked render returns a node with a new tag, e.g., 'p'
        component.render = mock(
            () =>
                ({
                    attributes: {},
                    tag: 'p',
                    props: {},
                    children: [],
                } as NodeItem)
        );

        component.setState({ count: 456 }); // Trigger updateNode

        expect(mockReplaceNode).toHaveBeenCalled();
        expect(mockUpdateDomAttributes).not.toHaveBeenCalled();
    });
});
