/*
import * as React from 'mini-react';
import { useDeepMemo } from 'hooks';
import { TreeNode } from 'mini-react/vdom';
import { AnyElementProps, ElementProps, ParsedStyleProps, StyleProps, UIElementType } from '../types';
import { defaultStyle, elementTypeToName, mergeStyleProps } from '../utils';
import { StyleParser } from '../utils/parser';

type ElementContext = {
    props: AnyElementProps;
    style: StyleProps;
    hoverStyle: StyleProps;
    focusStyle: StyleProps;
    parsedStyle: ParsedStyleProps;
    parsedHoverStyle: ParsedStyleProps;
    parsedFocusStyle: ParsedStyleProps;
};

const ElementContext = React.createContext<ElementContext>();
ElementContext.Provider.displayName = 'ElementProvider';

export function useParentElement() {
    return React.useContext(ElementContext);
}

export function useElement<Type extends UIElementType>(props: ElementProps<Type>) {
    const parent = useParentElement();

    const parentStyle = React.useMemo(() => (parent ? parent.style : defaultStyle()), [parent]);
    const parentHoverStyle = React.useMemo(() => (parent ? parent.hoverStyle : defaultStyle()), [parent]);
    const parentFocusStyle = React.useMemo(() => (parent ? parent.focusStyle : defaultStyle()), [parent]);

    const style = props.style ? mergeStyleProps(parentStyle, props.style) : parentStyle;
    const hoverStyle = props.hoverStyle ? mergeStyleProps(parentHoverStyle, props.hoverStyle) : parentHoverStyle;
    const focusStyle = props.focusStyle ? mergeStyleProps(parentFocusStyle, props.focusStyle) : parentFocusStyle;

    const parsedStyle = useDeepMemo(() => StyleParser.parseStyleProps(style), [style]);
    const parsedHoverStyle = useDeepMemo(() => StyleParser.parseStyleProps(hoverStyle), [hoverStyle]);
    const parsedFocusStyle = useDeepMemo(() => StyleParser.parseStyleProps(focusStyle), [focusStyle]);

    const self: ElementContext = {
        props,
        style,
        hoverStyle,
        focusStyle,
        parsedStyle,
        parsedHoverStyle,
        parsedFocusStyle
    };

    return self;
}

export function createElementComponent<Type extends UIElementType>(type: Type) {
    const Component: React.FC<Omit<ElementProps<Type>, 'type'>> = props => {
        const ctx = useElement({ type, ...props });

        const currentNode = TreeNode.current;
        currentNode!.provideContext(ElementContext.id, ctx);

        React.useEffect(() => {
            for (const node of ElementContext.listeningNodes) {
                node.root.enqueueForRender(node);
            }
        }, [ctx]);

        return props.children;
    };

    Component.displayName = elementTypeToName(type);

    return Component;
}
*/
