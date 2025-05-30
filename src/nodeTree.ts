import { NodeItem } from './types/nodeTree';

let nodeTree: NodeItem;
export function cacheNodeTree(tree: NodeItem) {
    nodeTree = tree;
}
function traverseTree(tree: NodeItem, callback: (node: NodeItem) => boolean | void) { // tree: any -> NodeItem, node: any -> NodeItem
    if (!tree) return; // Added null check for tree
    if (callback(tree)) {
        return;
    }
    if (tree.children) {
        if (Array.isArray(tree.children)) {
            tree.children.forEach((child: NodeItem) => { // child: any -> NodeItem
                traverseTree(child, callback);
            });
        } else {
            // This case implies tree.children is a single NodeItem, which contradicts NodeItem.children type (NodeItem[])
            // However, to maintain existing logic structure and just fix 'any':
            traverseTree(tree.children as unknown as NodeItem, callback); // Cast needed if children is not array
        }
    }
}
export function getNodeById(id: string): NodeItem | undefined {
    let result: NodeItem | undefined;
    traverseTree(nodeTree, (node) => {
        if (node.component?._id === id) {
            result = node;
            return; // This return seems to be for the callback, not forEach
        }
    });
    return result;
}
export function queryNodeList(selector: string): NodeItem[] {
    console.log('node tree: ', nodeTree);
    if (!document || typeof document.querySelectorAll !== 'function') { // Guard against undefined document
        return [];
    }
    const elements = document.querySelectorAll(selector);
    const results: NodeItem[] = [];
    Array.from(elements).forEach((element) => {
        const id = element.getAttribute('node-id');
        if (id) {
            const node = getNodeById(id);
            if (node) {
                results.push(node);
            }
        }
    });
    return results;
}
export function queryOneNode(selector: string): NodeItem | undefined {
    return queryNodeList(selector)[0];
}
