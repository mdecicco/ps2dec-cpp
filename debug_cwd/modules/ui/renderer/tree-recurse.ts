import { Element } from './element';

export class IElementRecursion {
    private m_elementStack: Element[];

    constructor() {
        this.m_elementStack = [];
    }

    get currentElement() {
        if (this.m_elementStack.length === 0) return null;
        return this.m_elementStack[this.m_elementStack.length - 1];
    }

    begin(element: Element) {
        this.m_elementStack.push(element);
    }

    end() {
        this.m_elementStack.pop();
    }
}
