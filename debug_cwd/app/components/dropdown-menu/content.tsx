import * as React from 'mini-react';
import { Box, BoxProps } from 'ui';
import { Separator } from '../separator';
import { Theme } from '@app/types';
import { useTheme } from '@app/contexts';

type DropdownMenuSeparatorProps = BoxProps & {
    theme: Theme;
};

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = props => {
    const { theme } = props;

    return (
        <Box
            style={{
                width: '100%',
                height: '1px',
                marginTop: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
                backgroundColor: theme.colors.border
            }}
        />
    );
};

export const DropdownMenuContent: React.FC<Omit<BoxProps, 'ref'>> = props => {
    const theme = useTheme();
    const childrenArray = React.flattenChildren(props.children);

    for (let i = 0; i < childrenArray.length; i++) {
        const child = childrenArray[i];
        if (!React.isReactElement(child)) continue;

        if (child.type === Separator) {
            childrenArray[i] = <DropdownMenuSeparator theme={theme} />;
        }
    }

    return childrenArray;
};
