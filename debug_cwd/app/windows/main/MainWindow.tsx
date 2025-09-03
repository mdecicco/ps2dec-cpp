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
    Toolbar
} from '@app/components';
import { FaCheck, FaChevronRight, FaFile, FaFloppyDisk } from 'font-awesome-solid';
import { useTheme } from '@app/contexts';
import { decompiler } from 'decompiler';

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
                        <DropdownMenuItem suffix={<Icon icon={FaChevronRight} />}>Submenu</DropdownMenuItem>
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
        </Background>
    );
};

MainWindow.title = 'ps2dec';
MainWindow.width = 400;
MainWindow.height = 400;
