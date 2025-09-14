import * as React from 'mini-react';
import { Box } from 'ui';

import { WindowComponent } from '@app/windows/types';
import { Background, WorkspaceNavigator } from '@app/components';
import { MainToolbar } from './MainToolbar';

export const MainWindow: WindowComponent = () => {
    return (
        <Background style={{ flexDirection: 'column' }}>
            <MainToolbar />
            <Box style={{ flexDirection: 'row', flexGrow: 1, width: '100%' }}>
                <WorkspaceNavigator />
                <Box style={{ flexDirection: 'column', flexGrow: 1, height: '100%' }}></Box>
            </Box>
        </Background>
    );
};

MainWindow.title = '';
MainWindow.width = 400;
MainWindow.height = 400;
