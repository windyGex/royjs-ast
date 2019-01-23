import ActionNode from './store';
import ElementNode from './view';
import ServiceNode from './service';

/* 兼容代码 */
export const Action = ActionNode;
export const Element = ElementNode;

export const Store = ActionNode;
export const View = ElementNode;
export const Service = ServiceNode;

export default {
    Store: ActionNode,
    View: ElementNode,
    Service: ServiceNode
};

