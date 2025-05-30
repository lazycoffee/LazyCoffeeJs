import { Component } from "../component";

export type NodeItem = {
    tag: string;
    text?: string;
    component?: Component<any>; // Making component's state type explicit as any for now
    attributes: Record<string, string | number | boolean | undefined | Record<string, string | number>>; // Allow style object
    __eventHandlers?: Record<string, EventListener>;
    children: NodeItem[];
    element?: NodeElement;
    props?: Record<string, unknown>;
    parent?: NodeItem;
};

type NodeElement = HTMLElement | DocumentFragment | Text;
