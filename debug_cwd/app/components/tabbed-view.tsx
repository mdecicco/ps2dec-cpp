import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';

type TabInfo = {
    key: React.Key;
    node: React.ReactElement;
    label: string;
    onClose?: () => void;
};

function getTabId(tab: TabInfo): React.Key {
    return tab.key ?? tab.label;
}

type TabViewProps = BoxProps & {
    key?: React.Key;
    label: string;
    onClose?: () => void;
};

export const TabView: React.FC<TabViewProps> = props => {
    const { style, children, label, onClose, ...rest } = props;
    return (
        <Box style={style} {...rest}>
            {children}
        </Box>
    );
};

type TabbedViewProps = BoxProps & {};
export const TabbedView: React.FC<TabbedViewProps> = props => {
    const { style, children, ...rest } = props;
    const theme = useTheme();

    const childrenArray = React.flattenChildren(props.children);
    const tabs: TabInfo[] = [];

    for (const child of childrenArray) {
        if (!React.isReactElement(child)) continue;
        if (child.type === TabView) {
            const tabProps = child.props as TabViewProps;
            const key: React.Key = tabProps.key ?? tabProps.label;

            tabs.push({
                key,
                node: React.cloneElement(child, { key }),
                label: tabProps.label,
                onClose: tabProps.onClose
            });
        }
    }

    const [activeTabId, setActiveTabId] = React.useState<React.Key | null>(tabs.length > 0 ? getTabId(tabs[0]) : null);
    const activeTab = tabs.find(tab => getTabId(tab) === activeTabId);

    const mergedStyle: StyleProps = {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderBottomWidth: '1px',
        borderBottomColor: theme.colors.border,
        borderBottomStyle: 'solid',
        ...style,
        flexDirection: 'column'
    };

    const tabStyle: StyleProps = {
        color: theme.colors.text,
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        borderTopLeftRadius: theme.borders.radius.sm,
        borderTopRightRadius: theme.borders.radius.sm,
        cursor: 'pointer'
    };

    return (
        <Box style={mergedStyle} {...rest}>
            <Box
                style={{
                    width: '100%',
                    flexShrink: 1,
                    flexDirection: 'row',
                    gap: theme.spacing.sm,
                    backgroundColor: theme.colors.background
                }}
            >
                {tabs.map(tab => (
                    <Box
                        key={tab.key}
                        style={{
                            ...tabStyle,
                            backgroundColor: activeTab === tab ? theme.colors.surface : theme.colors.background
                        }}
                        onClick={() => setActiveTabId(getTabId(tab))}
                    >
                        {tab.label}
                    </Box>
                ))}
            </Box>
            <Box
                style={{
                    width: '100%',
                    flexGrow: 1,
                    backgroundColor: theme.colors.surface
                }}
            >
                {activeTab?.node}
            </Box>
        </Box>
    );
};
