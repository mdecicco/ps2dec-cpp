import * as React from 'mini-react';

import { WindowComponent } from '@app/windows/types';
import { Background, Flex, WorkspaceNavigator } from '@app/components';
import { MainToolbar } from './MainToolbar';

export const MainWindow: WindowComponent = () => {
    return (
        <Background fd='column'>
            <MainToolbar />
            <Flex fd='row' grow={1} w='100%'>
                <WorkspaceNavigator />
                <Flex fd='column' grow={1} h='100%'></Flex>
            </Flex>
        </Background>
    );
};

MainWindow.title = '';
MainWindow.width = 400;
MainWindow.height = 400;
