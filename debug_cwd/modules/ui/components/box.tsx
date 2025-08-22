import * as React from 'mini-react';
import { BoxProps } from '../types';

export const Box: React.FC<BoxProps> = props => {
    return props.children;
};
