import * as React from 'mini-react';

import { WindowComponent } from '@app/windows/types';
import { Background, Button, Toolbar } from '@app/components';

export const MainWindow: WindowComponent = () => {
    return (
        <Background style={{ flexDirection: 'column' }}>
            <Toolbar>
                <Button variant='transparent' size='sm'>
                    Click me
                </Button>
                <Button variant='transparent' size='sm'>
                    Click me
                </Button>
                <Button variant='transparent' size='sm'>
                    Click me
                </Button>
                <Button variant='transparent' size='sm'>
                    Click me
                </Button>
            </Toolbar>
        </Background>
    );
};

MainWindow.title = 'ps2dec';
MainWindow.width = 400;
MainWindow.height = 400;
