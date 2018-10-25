import ActionNode from './store';
import ElementNode from './view';

/* 兼容代码 */
export const Action = ActionNode;
export const Element = ElementNode;

export const Store = ActionNode;
export const View = ElementNode;

export default {
    Store: ActionNode,
    View: ElementNode
};

