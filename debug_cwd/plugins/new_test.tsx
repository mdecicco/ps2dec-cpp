import * as React from 'mini-react';
import { decompiler } from 'decompiler';
import { Window } from 'window';
import { WindowProvider } from 'components';
import PluginManager from 'plugin-manager';
import { IPlugin } from 'plugin';
import { Box, BoxProps, createRoot } from 'ui';
import { FaChevronDown, FaChevronUp, FaFaceSmile, FaTruck } from 'font-awesome-solid';

const HoverBox: React.FC<BoxProps> = props => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { style, children, ...rest } = props;

    const boxStyle = {
        ...style,
        backgroundColor: isHovered ? 'rgb(51, 51, 51)' : 'rgb(27, 27, 27)'
    };

    return (
        <Box {...rest} style={boxStyle} onMouseEnter={e => setIsHovered(true)} onMouseLeave={e => setIsHovered(false)}>
            {children}
        </Box>
    );
};

const Test: React.FC = () => {
    const [fontSize, setFontSize] = React.useState(10);
    const t = React.useRef(0);

    React.useEffect(() => {
        const listener = decompiler.onService(() => {
            t.current += 0.01;
            setFontSize(Math.sin(t.current) * 10 + 16);
        });

        return () => {
            decompiler.offService(listener);
        };
    }, []);

    return (
        <HoverBox
            style={{
                flex: 1,
                color: 'rgb(255, 255, 255)',
                borderRadius: '10vw',
                fontSize: `${fontSize}px`,
                overflow: 'hidden'
            }}
            onClick={e => console.log(`onClick: ${e}`)}
            onMouseDown={e => console.log(`onMouseDown: ${e}`)}
            onMouseUp={e => console.log(`onMouseUp: ${e}`)}
            onMouseEnter={e => console.log(`onMouseEnter: ${e}`)}
            onMouseLeave={e => console.log(`onMouseLeave: ${e}`)}
            onMouseMove={e => console.log(`onMouseMove: ${e}`)}
            onMouseOut={e => console.log(`onMouseOut: ${e}`)}
            onMouseOver={e => console.log(`onMouseOver: ${e}`)}
            onMouseWheel={e => console.log(`onMouseWheel: ${e}`)}
            onScroll={e => console.log(`onScroll: ${e}`)}
            onKeyDown={e => console.log(`onKeyDown: ${e}`)}
            onKeyUp={e => console.log(`onKeyUp: ${e}`)}
            onFocus={e => console.log(`onFocus: ${e}`)}
            onBlur={e => console.log(`onBlur: ${e}`)}
            onResize={e => console.log(`onResize: ${e}`)}
        >
            Test {fontSize}
        </HoverBox>
    );
};

class NewTestPlugin extends IPlugin {
    constructor() {
        super('NewTestPlugin');
    }

    onInitialize() {
        const window = new Window();
        decompiler.addWindow(window);

        const root = createRoot(window);
        root.addFontFamily(
            {
                name: 'arial',
                filePath: 'font/ARIAL.TTF',
                sdfFactorMax: 1,
                sdfFactorMin: 0
            },
            true
        );
        root.addFontFamily({
            name: 'FontAwesome',
            filePath: 'font/fa7-solid-900.otf',
            sdfFactorMax: 1,
            sdfFactorMin: 0,
            codepoints: [FaFaceSmile, FaTruck, FaChevronDown, FaChevronUp]
        });

        root.render(
            <WindowProvider window={window} open={true}>
                <Box
                    style={{
                        width: '100%',
                        height: '100%',
                        paddingTop: '10px',
                        paddingRight: '10px',
                        paddingBottom: '10px',
                        paddingLeft: '10px',
                        alignItems: 'stretch',
                        gap: '10px',
                        backgroundColor: 'rgb(0, 0, 0)'
                    }}
                >
                    <Box
                        style={{
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        }}
                    >
                        <HoverBox
                            style={{
                                flex: 1,
                                borderRadius: '5px',
                                borderTopLeftRadius: '30px',
                                fontFamily: 'FontAwesome',
                                color: '#ffffff',
                                fontSize: '24px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.1rem'
                            }}
                        >
                            {FaChevronDown}
                            {FaFaceSmile}
                            {FaTruck}
                            {FaChevronUp}
                        </HoverBox>
                        <HoverBox style={{ flex: 1, borderRadius: '5px' }} />
                        <HoverBox
                            style={{
                                flex: 1,
                                borderRadius: '5px',
                                borderBottomLeftRadius: '30px'
                            }}
                        />
                    </Box>
                    <Box
                        style={{
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        }}
                    >
                        <HoverBox style={{ flex: 1, borderRadius: '5px' }} />
                        <Test />
                        <HoverBox style={{ flex: 1, borderRadius: '5px' }} />
                    </Box>
                    <Box
                        style={{
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        }}
                    >
                        <HoverBox
                            style={{
                                flex: 1,
                                borderRadius: '5px',
                                borderTopRightRadius: '30px'
                            }}
                        />
                        <HoverBox style={{ flex: 1, borderRadius: '5px' }} />
                        <HoverBox
                            style={{
                                flex: 1,
                                borderRadius: '5px',
                                borderBottomRightRadius: '30px'
                            }}
                        />
                    </Box>
                </Box>
            </WindowProvider>
        );
    }
}

PluginManager.addPlugin(new NewTestPlugin());
