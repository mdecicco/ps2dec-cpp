import * as React from 'mini-react';
import { StyleProps } from 'ui';

import { useTheme } from '@app/contexts';
import { FlexProps, Flex } from '@app/components/flex';

type ToolbarProps = FlexProps & {};

export const Toolbar: React.FC<ToolbarProps> = props => {
    const { style, children, ...rest } = props;
    const theme = useTheme();

    const mergedStyle: StyleProps = {
        backgroundColor: theme.colors.background,
        width: '100%',
        padding: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.border}`,
        flexDirection: 'row',
        gap: theme.spacing.sm,
        ...style
    };

    return (
        <Flex style={mergedStyle} {...rest}>
            {children}
        </Flex>
    );
};
