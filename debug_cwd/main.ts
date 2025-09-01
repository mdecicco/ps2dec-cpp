import Manager from 'plugin-manager';
import './plugins';
import { WindowManager } from '@app/managers';

export function main() {
    setTimeout(() => {
        Manager.initialize();
        WindowManager.get().openWindow('Main');
    }, 1000);
}
