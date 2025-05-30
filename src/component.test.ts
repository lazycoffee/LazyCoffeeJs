import { expect, test, describe, beforeEach, mock } from "bun:test";
import { Component } from './component';
import { getNodeById } from './nodeTree';
import { createElement, createElementTree, removeNodeElement } from './element';
import { replaceNode, updateDomAttributes } from './lib/nodeUpdater';
import { NodeItem } from "./types/nodeTree";

// Mock dependencies
const mockGetNodeById = mock(() => {});
const mockCreateElement = mock(() => ({} as HTMLElement)); // Ensure it returns a mock element
const mockCreateElementTree = mock(() => {});
const mockRemoveNodeElement = mock(() => {});
const mockReplaceNode = mock(() => {});
const mockUpdateDomAttributes = mock(() => {});

mock.module('./nodeTree', () => ({
  getNodeById: mockGetNodeById,
}));
mock.module('./element', () => ({
  createElement: mockCreateElement,
  createElementTree: mockCreateElementTree,
  removeNodeElement: mockRemoveNodeElement,
}));
mock.module('./lib/nodeUpdater', () => ({
  replaceNode: mockReplaceNode,
  updateDomAttributes: mockUpdateDomAttributes,
}));

describe('Component', () => {
  let component: Component<{ count: number; message?: string }>;
  let componentRenderMock: mock<any>; // Use Bun's mock type

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

    // Mock a basic render function for testing updateNode
    componentRenderMock = mock(() => ({ _id: component._id, tag: 'div', props: {}, children: [] } as NodeItem));
    component.render = componentRenderMock;

    // Mock that the node exists for updateNode to proceed
    mockGetNodeById.mockReturnValue({
      _id: component._id,
      tag: 'div', // Initial tag
      props: {},
      children: [],
      component: component,
      element: {} as HTMLElement // Mock element to avoid issues in updateNode
    });

    // Ensure createElement returns a basic mocked element for updateNode logic
    mockCreateElement.mockReturnValue({} as HTMLElement);
  });

  test('should initialize with an empty state object by default', () => {
    expect(component.state).toEqual({});
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
    component.render = mock(() => ({ _id: component._id, tag: 'div', props: {newProp: 'value'}, children: [] } as NodeItem));

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
        _id: component._id,
        tag: 'span', // Old tag
        props: {},
        children: [],
        component: component,
        element: {} as HTMLElement
    });

    // Ensure the mocked render returns a node with a new tag, e.g., 'p'
    component.render = mock(() => ({ _id: component._id, tag: 'p', props: {}, children: [] } as NodeItem));

    component.setState({ count: 456 }); // Trigger updateNode

    expect(mockReplaceNode).toHaveBeenCalled();
    expect(mockUpdateDomAttributes).not.toHaveBeenCalled();
  });
});
