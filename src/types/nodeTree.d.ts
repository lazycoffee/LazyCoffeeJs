import { Component } from "../component";

export type NodeItem = {
    tag: string;
    text?: string;
    component?: Component;
    attributes: {
        [key: string]: any;
    };
    __eventHandlers?: {
        [key: string]: any;
    };
    children: NodeItem[];
    element?: NodeElement;
    props?: {
        [key: string]: any;
    };
    parent?: NodeItem;
};

type NodeElement = HTMLElement | DocumentFragment | Text;
