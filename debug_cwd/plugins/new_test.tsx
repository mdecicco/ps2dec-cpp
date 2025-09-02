import * as React from 'mini-react';
import { decompiler } from 'decompiler';
import { Window } from 'window';
import { WindowProvider } from 'components';
import PluginManager from 'plugin-manager';
import { IPlugin } from 'plugin';
import { Box, BoxProps, createRoot, Geometry, StyleProps } from 'ui';
import { FaChevronDown, FaChevronUp, FaFaceSmile, FaTruck } from 'font-awesome-solid';
import { useInterpolatedState } from 'hooks';

const HoverBox: React.FC<BoxProps> = props => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [boxSize, setBoxSize, boxAnim] = useInterpolatedState(1, {
        duration: 1000,
        initialTarget: 50
    });
    const { style, children, ...rest } = props;

    const boxStyle: StyleProps = {
        ...style,
        overflow: 'scroll',
        backgroundColor: isHovered ? 'rgb(51, 51, 51)' : 'rgb(27, 27, 27)'
    };

    boxAnim.onComplete(v => {
        setBoxSize(v === 1 ? 50 : 1);
    });

    return (
        <Box {...rest} style={boxStyle} onMouseEnter={e => setIsHovered(true)} onMouseLeave={e => setIsHovered(false)}>
            {children}
            <Geometry
                vertices={[
                    { position: { x: 0, y: 0 } },
                    { position: { x: boxSize, y: 0 } },
                    { position: { x: boxSize, y: boxSize } },
                    { position: { x: 0, y: 0 } },
                    { position: { x: boxSize, y: boxSize } },
                    { position: { x: 0, y: boxSize } }
                ]}
                version={boxSize}
            />
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

const Test1: React.FC = () => {
    return (
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
    );
};

const Test2: React.FC = () => {
    const [fontSize, setFontSize, fontAnim] = useInterpolatedState(14, {
        duration: 8000,
        initialTarget: 128,
        easing: t => 3 * t * t - 2 * t * t * t
    });
    fontAnim.onComplete(v => {
        setFontSize(v === 14 ? 128 : 14);
    });
    return (
        <Box
            style={{
                width: '90%',
                height: '90%',
                margin: '5%',
                backgroundColor: 'rgb(92, 92, 92)',
                color: 'rgb(0, 0, 0)',
                fontSize: `${fontSize}px`,
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '0.8em',
                textAlign: 'justify'
            }}
        >
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
            placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar
            vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc
            posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra
            inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
            pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia
            integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia
            nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex
            sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean
            sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl
            malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora
            torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit.
            Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.
            Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti
            sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur
            adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus
            duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus
            bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
            aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet
            consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
            pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus
            nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper
            vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum
            dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In
            id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
            fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
            hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
            placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar
            vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc
            posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra
            inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
            pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia
            integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia
            nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex
            sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean
            sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl
            malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora
            torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit.
            Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.
            Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti
            sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur
            adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus
            duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus
            bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
            aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet
            consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
            pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus
            nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper
            vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum
            dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In
            id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
            fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
            hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
            placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar
            vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc
            posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra
            inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
            pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia
            integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia
            nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex
            sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean
            sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl
            malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora
            torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit.
            Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.
            Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti
            sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur
            adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus
            duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus
            bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class
            aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet
            consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
            pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus
            nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper
            vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum
            dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In
            id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus
            fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
            hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem
            placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar
            vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc
            posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra
            inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae
            pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia
            integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia
            nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex
            sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean
            sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl
            malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora
            torquent per conubia nostra inceptos himenaeos.
        </Box>
    );
};

const Test3: React.FC = () => {
    const [items, setItems] = React.useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    React.useEffect(() => {
        if (items.length === 0) {
            setItems([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            return;
        }

        const timeout = setTimeout(() => {
            setItems(items.slice(1));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [items]);

    return (
        <Box
            style={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                color: 'rgb(255, 255, 255)',
                padding: '10px',
                gap: '3px'
            }}
        >
            {items.map(item => (
                <Box
                    key={item}
                    style={{
                        padding: '10px',
                        borderRadius: '15px',
                        borderTopRightRadius: '0px',
                        borderBottomRightRadius: '0px',
                        width: '50%',
                        backgroundColor: 'rgb(55, 65, 109)',
                        border: '10px solid rgb(255, 255, 255)'
                    }}
                >
                    {item}
                </Box>
            ))}
        </Box>
    );
};

class NewTestPlugin extends IPlugin {
    constructor() {
        super('NewTestPlugin');
    }

    onWindowOpened(window: Window) {
        const root = createRoot(window);
        root.addFontFamily(
            {
                name: 'Roboto',
                filePath: 'font/roboto.ttf',
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
            <WindowProvider window={window} onClose={() => decompiler.requestShutdown()}>
                <Test2 />
            </WindowProvider>
        );
    }

    onInitialize() {
        const window = new Window();
        decompiler.addWindow(window);

        const openListener = window.onOpen(() => {
            window.offOpen(openListener);
            this.onWindowOpened(window);
        });

        setTimeout(() => {
            window.setOpen(true);
        }, 1000);
    }
}

PluginManager.addPlugin(new NewTestPlugin());
