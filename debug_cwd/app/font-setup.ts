import * as Icons from 'font-awesome-solid';
import { UIRoot } from 'ui/root';

export function setupFonts(root: UIRoot) {
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
        codepoints: [Icons.FaFaceSmile, Icons.FaTruck, Icons.FaChevronDown, Icons.FaChevronUp]
    });
}
