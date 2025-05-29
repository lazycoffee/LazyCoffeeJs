import { produce } from 'immer';
export function setState(node: any, updater: (draft: any) => void) {
    node.state = produce(node.state, updater);
    // update node elements
    
}