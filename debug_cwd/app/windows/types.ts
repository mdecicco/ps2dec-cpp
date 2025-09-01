import * as React from 'mini-react';

export type WindowStaticProps = {
    title?: string;
    width?: number;
    height?: number;
};

export type WindowComponent<P = {}> = React.FC<P> & WindowStaticProps;
