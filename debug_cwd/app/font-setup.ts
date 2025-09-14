import * as Icons from 'font-awesome-solid';
import { UIRoot } from 'ui/root';
import { FontManager } from 'ui/utils';

export function setupFonts(root: UIRoot) {
    FontManager.defaultFontSize = 18;

    root.addFontFamily(
        {
            name: 'Roboto',
            filePath: 'font/Roboto-Regular.ttf',
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
        codepoints: [
            Icons.FaCheck,
            Icons.FaChevronDown,
            Icons.FaChevronUp,
            Icons.FaChevronRight,
            Icons.FaChevronLeft,
            Icons.FaFile,
            Icons.FaFloppyDisk,
            Icons.FaFileImport,
            Icons.FaXmark
        ]
    });
}
