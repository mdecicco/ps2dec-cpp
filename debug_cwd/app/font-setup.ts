import * as Icons from 'font-awesome-solid';
import { UIRoot } from 'ui/root';

export function setupFonts(root: UIRoot) {
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
        codepoints: [Icons.FaFaceSmile, Icons.FaTruck, Icons.FaChevronDown, Icons.FaChevronUp]
    });
}
