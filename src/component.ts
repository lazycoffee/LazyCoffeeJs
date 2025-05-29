import { produce } from 'immer';
import { getNodeById } from './nodeTree';
import { removeitemInArray, uuid } from './lib/helper';
import { createElement, createElementTree, removeNodeElement } from './element';
import { replaceNode, updateDomAttributes } from './lib/nodeUpdater';
import { NodeItem } from './types/nodeTree';

export class Component<T extends JSONValue = Record<string, JSONValue>> {
    constructor() {}
    render(props: any): NodeItem | undefined | null {
        return;
    }
    state: T = {} as T;
    readonly _id: string = uuid();
    setState(nextState: Partial<T>) {
        this.state = produce(this.state, (draft: any) =>
            Object.assign(draft, nextState)
        );
        this.updateNode();
    }
    updateState(updater: (draft: T) => any) {
        this.state = produce(this.state, updater);
        this.updateNode();
    }
    updateNode() {
        const oldNode = getNodeById(this._id);
        console.log('state', this.state);
        console.log('updateNode', oldNode);
        if (!oldNode) {
            throw new Error('updateNode: node not found');
        }
        const component = this as any;
        const newNode = component.render(oldNode.props);
        console.log('newNode', newNode);
        newNode.props = { ...oldNode.props, ...newNode.props };
        newNode.component = component;
        // traverse node tree
        function recursive(_newNode: NodeItem, _oldNode: NodeItem) {
            // 替换节点实例
            _oldNode.component = _newNode.component;
            _oldNode.props = _newNode.props;
            if (_newNode.tag !== _oldNode.tag) {
                // tag不一样时，直接替换
                replaceNode(_newNode, _oldNode);
            } else {
                // tag一样时，比较属性，并更新
                updateDomAttributes(_newNode, _oldNode);
            }
            _oldNode.attributes = _newNode.attributes;
            const newChildren = _newNode.children || [];
            const oldChildren = _oldNode.children || [];
            const length = Math.max(newChildren.length, oldChildren.length);
            for (let i = 0; i < length; i++) {
                const newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if (!newChild) {
                    // 新节点不存在时，删除旧节点
                    oldChild.element && removeNodeElement(oldChild.element);
                    removeitemInArray(oldChildren, oldChild);
                    continue;
                }
                if (!oldChild) {
                    // 旧节点不存在时，创建新节点
                    oldChild = {
                        ...newChild,
                        parent: _oldNode,
                    };
                    oldChild.element = createElement(oldChild);
                    if (!_oldNode.element) {
                        throw new Error('updateNode: oldNode.element is null');
                    }
                    _oldNode.element.appendChild(oldChild.element);
                    oldChildren.push(oldChild);
                }
                recursive(newChild, oldChild);
            }
        }
        recursive(newNode, oldNode);
    }
}
