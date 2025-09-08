import * as React from 'mini-react';

import { WindowComponent } from '@app/windows/types';
import {
    Background,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon,
    Separator,
    TabbedView,
    TabView,
    Toolbar,
    PopoverDirection
} from '@app/components';
import { FaCheck, FaChevronRight, FaFile, FaFloppyDisk } from 'font-awesome-solid';
import { useTheme } from '@app/contexts';
import { decompiler } from 'decompiler';

const Submenu: React.FC = () => {
    const theme = useTheme();
    return (
        <DropdownMenu
            offsetX={`calc(${theme.spacing.sm} * 2)`}
            offsetY={`calc(${theme.spacing.sm} * -1.5)`}
            direction={PopoverDirection.Right}
        >
            <DropdownMenuTrigger>
                <DropdownMenuItem suffix={<Icon icon={FaChevronRight} />} noCloseBehavior>
                    Submenu
                </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Submenu Item 1</DropdownMenuItem>
                <DropdownMenuItem>Submenu Item 2</DropdownMenuItem>
                <DropdownMenuItem>Submenu Item 3</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const MainWindow: WindowComponent = () => {
    const theme = useTheme();
    return (
        <Background style={{ flexDirection: 'column' }}>
            <Toolbar>
                <DropdownMenu offsetY={`calc(${theme.spacing.sm} * 2)`}>
                    <DropdownMenuTrigger>
                        <Button variant='transparent' size='xs'>
                            File
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent style={{ minWidth: '200px' }}>
                        <DropdownMenuItem tip='CTRL+O' prefix={<Icon icon={FaFile} />}>
                            Open
                        </DropdownMenuItem>
                        <DropdownMenuItem tip='CTRL+S' prefix={<Icon icon={FaFloppyDisk} />}>
                            Save
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem prefix={<Icon icon={FaCheck} />}>I'm Checked</DropdownMenuItem>
                        <Submenu />
                        <Separator />
                        <DropdownMenuItem
                            tip='CTRL+Q'
                            onClick={() => {
                                decompiler.requestShutdown();
                            }}
                        >
                            Exit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Toolbar>
            <TabbedView style={{ flexGrow: 1, width: '100%' }}>
                <TabView label='Tab 1'>Tab 1</TabView>
                <TabView label='Tab 2'>Tab 2</TabView>
                <TabView label='Tab 3'>Tab 3</TabView>
            </TabbedView>
        </Background>
    );
};

MainWindow.title = 'ps2dec';
MainWindow.width = 400;
MainWindow.height = 400;
