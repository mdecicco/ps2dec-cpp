import * as React from 'mini-react';
import { StyleProps } from 'ui';

import { useTheme } from '@app/contexts';
import { Flex, FlexProps } from '@app/components/flex';
import { Tab } from './tab';

type TabInfo = {
    key: React.Key;
    node: React.ReactElement;
    label: string;
    onClose?: () => void;
};

function getTabId(tab: TabInfo): React.Key {
    return tab.key ?? tab.label;
}

type TabViewProps = FlexProps & {
    key?: React.Key;
    label: string;
    onClose?: () => void;
};

export const TabView: React.FC<TabViewProps> = props => {
    const { style, children, label, onClose, ...rest } = props;
    return (
        <Flex style={style} {...rest}>
            {children}
        </Flex>
    );
};

type TabbedViewProps = FlexProps & {};
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

    React.useEffect(() => {
        if (tabs.length === 0 || activeTab) return;
        setActiveTabId(getTabId(tabs[0]));
    }, [tabs, activeTab]);

    const mergedStyle: StyleProps = {
        ...style,
        flexDirection: 'column'
    };

    return (
        <Flex style={mergedStyle} {...rest}>
            <Flex w='100%' shrink={1} fd='row' gap='sm' bg={theme.colors.background}>
                {tabs.map(tab => (
                    <Tab
                        key={tab.key}
                        isActive={activeTab === tab}
                        label={tab.label}
                        onClose={tab.onClose}
                        onClick={() => setActiveTabId(getTabId(tab))}
                    />
                ))}
            </Flex>
            <Flex w='100%' bg={theme.colors.surface} grow={1}>
                {activeTab?.node}
            </Flex>
        </Flex>
    );
};
