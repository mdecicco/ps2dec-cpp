import * as React from 'mini-react';
import { decompiler } from 'decompiler';
import { FaFile, FaFileImport, FaFloppyDisk } from 'font-awesome-solid';

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Icon,
    Separator,
    Toolbar
} from '@app/components';
import { useTheme, useWorkspace } from '@app/contexts';
import { WorkspaceManager } from '@app/managers';

export const MainToolbar: React.FC = () => {
    const theme = useTheme();
    const { workspace, workspaceHasChanges, saveWorkspace, importBinary } = useWorkspace();

    const openWorkspace = () => {
        WorkspaceManager.get().openWorkspace();
    };

    return (
        <Toolbar>
            <DropdownMenu offsetY={`calc(${theme.spacing.sm} * 2)`}>
                <DropdownMenuTrigger>
                    <Button variant='transparent' size='md'>
                        File
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent style={{ minWidth: '200px' }}>
                    <DropdownMenuItem
                        prefix={<Icon icon={FaFile} />}
                        onSelect={openWorkspace}
                        hotkey={{ key: KeyboardKey.O, ctrlKey: true }}
                    >
                        Open Workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        prefix={<Icon icon={FaFloppyDisk} />}
                        onSelect={saveWorkspace}
                        hotkey={{ key: KeyboardKey.S, ctrlKey: true }}
                        disabled={!workspace || !workspaceHasChanges}
                    >
                        Save Workspace
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem
                        prefix={<Icon icon={FaFileImport} />}
                        onSelect={importBinary}
                        disabled={!workspace}
                    >
                        Import Binary
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem
                        hotkey={{ key: KeyboardKey.Q, ctrlKey: true }}
                        onSelect={() => {
                            decompiler.requestShutdown();
                        }}
                    >
                        Exit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Toolbar>
    );
};
