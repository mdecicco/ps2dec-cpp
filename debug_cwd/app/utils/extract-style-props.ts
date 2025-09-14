import { StyleProps } from 'ui';

import { Theme, ShorthandStyleProps } from '@app/types';

function extractSize(val: string, theme: Theme): string {
    if (val === 'xxs') return theme.spacing.xxs;
    else if (val === 'xs') return theme.spacing.xs;
    else if (val === 'sm') return theme.spacing.sm;
    else if (val === 'md') return theme.spacing.md;
    else if (val === 'lg') return theme.spacing.lg;
    else if (val === 'xl') return theme.spacing.xl;
    else if (val === 'xxl') return theme.spacing.xxl;

    return val;
}

function extractTypographySize(val: string, theme: Theme): string {
    if (val === 'xs') return theme.typography.size.xs;
    else if (val === 'sm') return theme.typography.size.sm;
    else if (val === 'md') return theme.typography.size.md;
    else if (val === 'lg') return theme.typography.size.lg;
    else if (val === 'xl') return theme.typography.size.xl;

    return val;
}

export function extractStyleProps(props: ShorthandStyleProps, theme: Theme): StyleProps {
    const styleProps: StyleProps = {};

    if (props.c) styleProps.color = props.c;
    if (props.w) styleProps.width = extractSize(props.w, theme);
    if (props.h) styleProps.height = extractSize(props.h, theme);
    if (props.minw) styleProps.minWidth = extractSize(props.minw, theme);
    if (props.maxw) styleProps.maxWidth = extractSize(props.maxw, theme);
    if (props.minh) styleProps.minHeight = extractSize(props.minh, theme);
    if (props.maxh) styleProps.maxHeight = extractSize(props.maxh, theme);
    if (props.bg) styleProps.backgroundColor = props.bg;
    if (props.grow) styleProps.flexGrow = props.grow;
    if (props.shrink) styleProps.flexShrink = props.shrink;
    if (props.ff) styleProps.fontFamily = props.ff;
    if (props.ta) styleProps.textAlign = props.ta;
    if (props.fd) styleProps.flexDirection = props.fd;
    if (props.jc) styleProps.justifyContent = props.jc;
    if (props.ai) styleProps.alignItems = props.ai;
    if (props.lh) styleProps.lineHeight = extractSize(props.lh, theme);
    if (props.p) styleProps.padding = extractSize(props.p, theme);
    if (props.pl) styleProps.paddingLeft = extractSize(props.pl, theme);
    if (props.pr) styleProps.paddingRight = extractSize(props.pr, theme);
    if (props.pt) styleProps.paddingTop = extractSize(props.pt, theme);
    if (props.pb) styleProps.paddingBottom = extractSize(props.pb, theme);
    if (props.m) styleProps.margin = extractSize(props.m, theme);
    if (props.ml) styleProps.marginLeft = extractSize(props.ml, theme);
    if (props.mr) styleProps.marginRight = extractSize(props.mr, theme);
    if (props.mt) styleProps.marginTop = extractSize(props.mt, theme);
    if (props.mb) styleProps.marginBottom = extractSize(props.mb, theme);
    if (props.gap) styleProps.gap = extractSize(props.gap, theme);
    if (props.fs) styleProps.fontSize = extractTypographySize(props.fs, theme);
    if (props.b) styleProps.border = props.b;
    if (props.bl) styleProps.borderLeft = props.bl;
    if (props.br) styleProps.borderRight = props.br;
    if (props.bt) styleProps.borderTop = props.bt;
    if (props.bb) styleProps.borderBottom = props.bb;

    return styleProps;
}
