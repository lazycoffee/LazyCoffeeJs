import { NodeItem } from './types/nodeTree';

let nodeTree: NodeItem;
export function cacheNodeTree(tree: NodeItem) {
    nodeTree = tree;
}
function traverseTree(tree: any, callback: (node: any) => boolean | void) {
    if (callback(tree)) {
        return;
    }
    if (tree.children) {
        if (Array.isArray(tree.children)) {
            tree.children.forEach((child: any) => {
                traverseTree(child, callback);
            });
        } else {
            traverseTree(tree.children, callback);
        }
    }
}
export function getNodeById(id: string): NodeItem | undefined {
    let result: NodeItem | undefined;
    traverseTree(nodeTree, (node) => {
        if (node.component?._id === id) {
            result = node;
            return true;
        }
    });
    return result;
}
export function queryNodeList(selector: string): NodeItem[] {
    console.log('node tree: ', nodeTree);
    const elemtns = document.querySelectorAll(selector);
    return Array.from(elemtns)
        .map((element) => {
            const id = element.getAttribute('node-id');
            if (!id) {
                return;
            }
            return getNodeById(id);
        })
        .filter((node) => !!node);
}
export function queryOneNode(selector: string): NodeItem | undefined {
    return queryNodeList(selector)[0];
}
