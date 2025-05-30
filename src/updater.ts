import { NodeItem } from "./types/nodeTree"; // Import NodeItem

export function update(
    mountPoint: HTMLElement, 
    jsxNode: NodeItem, 
    lastJsxNode: NodeItem | null // Assuming lastJsxNode might not exist on initial render
) {
    // TODO: update jsxNode to dom
    // Example: Diffing jsxNode against lastJsxNode and patching mountPoint
    if (lastJsxNode) {
        // Perform diff and update logic
        console.log('Updating DOM with new jsxNode, diffing against lastJsxNode:', lastJsxNode);
    } else {
        // Initial render or full replacement
        console.log('Initial render or full replacement with jsxNode.');
        // mountPoint.innerHTML = ''; // Clear previous content if it's a full replacement
        // const newElementTree = createElementTree(jsxNode);
        // if (newElementTree) mountPoint.appendChild(newElementTree);
    }
    console.log('New jsxNode:', jsxNode);
}
