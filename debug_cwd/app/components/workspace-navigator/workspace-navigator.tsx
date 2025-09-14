import * as React from 'mini-react';
import { FaChevronDown, FaChevronRight } from 'font-awesome-solid';
import { MouseEvent, StyleProps } from 'ui/types';
import { EasingMode, useInterpolatedColor } from 'hooks';

import { useTheme, useWorkspace } from '@app/contexts';
import { Button } from '@app/components/button';
import { Flex, FlexProps } from '@app/components/flex';
import { Icon } from '@app/components/icon';
import { Pane } from '@app/components/pane';

type TreeNodeProps = FlexProps & {
    depth: number;
    label: string;
    children?: React.ReactNode;
};

const TreeNode: React.FC<TreeNodeProps> = props => {
    const { label, children, onClick, onMouseEnter, onMouseLeave, bg, depth, ...rest } = props;
    const [isHovered, setIsHovered] = React.useState(false);

    const theme = useTheme();
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [bgColor] = useInterpolatedColor(
        props.bg || (isHovered ? theme.colors.lighter : 'rgba(0, 0, 0, 0)'),
        theme.durations.short,
        EasingMode.Linear
    );

    const ownMouseEnter = (e: MouseEvent) => {
        onMouseEnter?.(e);
        if (e.propagationStopped) return;

        setIsHovered(true);
    };

    const ownMouseLeave = (e: MouseEvent) => {
        onMouseLeave?.(e);
        if (e.propagationStopped) return;

        setIsHovered(false);
    };

    const ownClick = (e: MouseEvent) => {
        onClick?.(e);
        if (e.propagationStopped) return;

        setIsCollapsed(!isCollapsed);
    };

    const childArray = React.flattenChildren(children);

    return (
        <Flex fd='column' w='100%'>
            <Flex
                w='100%'
                fd='row'
                ai='center'
                c={theme.colors.text}
                bg={bgColor}
                onClick={ownClick}
                onMouseEnter={ownMouseEnter}
                onMouseLeave={ownMouseLeave}
                style={{ cursor: 'pointer', paddingLeft: `calc(${theme.spacing.lg} * ${depth})` }}
                {...rest}
            >
                {childArray.length > 0 ? (
                    <Icon icon={isCollapsed ? FaChevronRight : FaChevronDown} size='xs' w='lg' ta='center' />
                ) : null}
                {label}
            </Flex>
            {!isCollapsed && (
                <Flex fd='column' w='100%'>
                    {children}
                </Flex>
            )}
        </Flex>
    );
};

type WorkspaceNavigatorProps = {};

export const WorkspaceNavigator: React.FC<WorkspaceNavigatorProps> = props => {
    const { workspace, openWorkspace } = useWorkspace();
    const theme = useTheme();

    const paneStyle: StyleProps = {
        flexDirection: 'column',
        flex: 1,
        width: '15rem',
        height: '100%',
        minWidth: '10rem',
        backgroundColor: theme.colors.surface,
        borderRight: `1px solid ${theme.colors.border}`
    };

    if (!workspace) {
        return (
            <Pane resizeRight jc='center' ai='center' gap='sm' style={paneStyle}>
                <Flex fs='md' c={theme.colors.textSecondary}>
                    No Workspace Selected
                </Flex>
                <Button variant='outline' size='sm' onClick={openWorkspace}>
                    Open Workspace
                </Button>
            </Pane>
        );
    }

    return (
        <Pane style={paneStyle} resizeRight>
            <TreeNode label={workspace.name} w='100%' bg={theme.colors.darkest} depth={0}>
                {workspace.binaries.binaries.map(binary => (
                    <TreeNode key={binary.id} label={binary.filename} depth={1}>
                        <TreeNode label='Test 1' depth={2} />
                        <TreeNode label='Test 2' depth={2} />
                        <TreeNode label='Test 3' depth={2} />
                        <TreeNode label='Test 4' depth={2} />
                        <TreeNode label='Test 5' depth={2} />
                        <TreeNode label='Test 6' depth={2} />
                        <TreeNode label='Test 7' depth={2} />
                        <TreeNode label='Test 8' depth={2} />
                        <TreeNode label='Test 9' depth={2} />
                        <TreeNode label='Test 10' depth={2} />
                    </TreeNode>
                ))}
            </TreeNode>
        </Pane>
    );
};
