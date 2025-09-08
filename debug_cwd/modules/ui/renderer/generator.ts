import { Window } from 'window';
import { UINode } from '../types/ui-node';
import { Element } from './element';
import { IElementRecursion } from './tree-recurse';
import { DepthManager, FontManager, InstanceManager } from '../utils';

export class TreeGenerator extends IElementRecursion {
    private m_window: Window;
    private m_root: Element | null;
    private m_createdElements: Element[];
    private m_fontManager: FontManager;
    private m_depthManager: DepthManager;
    private m_instanceManager: InstanceManager;

    constructor(
        window: Window,
        fontManager: FontManager,
        depthManager: DepthManager,
        instanceManager: InstanceManager
    ) {
        super();
        this.m_window = window;
        this.m_root = null;
        this.m_createdElements = [];
        this.m_fontManager = fontManager;
        this.m_depthManager = depthManager;
        this.m_instanceManager = instanceManager;
    }

    private getOrCreateElement(src: UINode) {
        const currentElement = this.currentElement;

        let selfElement: Element | null = null;
        if (currentElement) {
            for (const child of currentElement.children) {
                if (child.treeNode === src.node) {
                    selfElement = child;
                    break;
                }
            }
        } else if (this.m_root) {
            if (this.m_root.treeNode === src.node) {
                selfElement = this.m_root;
            } else {
                this.m_root = null;
            }
        }

        if (!selfElement) {
            selfElement = new Element(
                this.m_window,
                src,
                this.m_root,
                currentElement,
                this.m_fontManager,
                this.m_depthManager
            );
            this.m_createdElements.push(selfElement);

            if (!this.m_root) {
                this.m_root = selfElement;
            }
        } else {
            Element.__internal_updateElement(selfElement, src);
        }

        return selfElement;
    }

    private generateTree(src: UINode) {
        const node = this.getOrCreateElement(src);

        this.begin(node);

        const children: Element[] = [];
        for (const child of src.children) {
            const childNode = this.generateTree(child);
            children.push(childNode);
        }
        Element.__internal_setChildren(node, children);

        this.end();

        return node;
    }

    private handleCreatedElements() {
        for (const element of this.m_createdElements) {
            this.m_instanceManager.allocateInstance(element);

            if (element.treeNode.props.ref) {
                if (typeof element.treeNode.props.ref === 'function') {
                    try {
                        element.treeNode.props.ref(element);
                    } catch (error) {
                        console.error('Failed to call ref function');
                        console.error(error);
                        element.treeNode.printNodeStack();
                    }
                } else {
                    element.treeNode.props.ref.current = element;
                }
            }

            element.treeNode.addListener('unmount', () => {
                this.m_instanceManager.freeInstance(element);
                Element.__internal_unmount(element);
            });
        }
    }

    generate(srcRoot: UINode) {
        this.m_createdElements = [];
        const genRoot = this.generateTree(srcRoot);
        this.handleCreatedElements();
        return genRoot;
    }
}
