import * as fs from '__internal:fs';
import * as path from 'path';
import { ClientWindow } from 'client-window';

import { Binary } from '@app/types/binary';
import type { Workspace } from '@app/types/workspace';
import { ColumnType, Table } from 'table';
import { EventProducer } from 'event';

type BinaryInfo = { id: number; filename: string };

type BinaryManagerEvents = {
    dirtyStateChange: (hasChanges: boolean) => void;
};

export class BinaryManager extends EventProducer<BinaryManagerEvents> {
    private static m_nextBinaryId: number = 1;
    private m_binaryPath: string;
    private m_workspace: Workspace;
    private m_binaries: Binary[];
    private m_hasChanges: boolean;
    private m_table: Table<BinaryInfo>;

    constructor(binaryPath: string, workspace: Workspace) {
        super();
        this.m_binaryPath = binaryPath;
        this.m_workspace = workspace;
        this.m_binaries = [];
        this.m_hasChanges = false;
        this.m_table = new Table<BinaryInfo>({
            id: [0, 'id', ColumnType.Number],
            filename: [1, 'filename', ColumnType.String]
        });
    }

    get path() {
        return this.m_binaryPath;
    }

    get workspace() {
        return this.m_workspace;
    }

    get binaries() {
        return Array.from(this.m_binaries);
    }

    get hasChanges() {
        return this.m_hasChanges;
    }

    set hasChanges(hasChanges: boolean) {
        if (this.m_hasChanges === hasChanges) return;
        this.m_hasChanges = hasChanges;
        this.dispatch('dirtyStateChange', hasChanges);
    }

    load() {
        const csvPath = `${this.m_binaryPath}/binaries.csv`;
        if (!fs.existsSync(csvPath)) return;
        this.m_table.parseFromFile(csvPath);

        for (const binary of this.m_table.rows) {
            const path = `${this.m_binaryPath}/${binary.id}.bin`;

            try {
                const data = fs.readFileSync(path);
                this.m_binaries.push(new Binary(binary.id, this.m_workspace, binary.filename, data));
            } catch (err) {
                throw new Error(`Failed to load binary ${binary.id} at path: ${path}: ${err}`);
            }
        }
    }

    save() {
        if (!this.m_hasChanges) return;

        if (!fs.existsSync(this.m_binaryPath)) {
            fs.mkdirSync(this.m_binaryPath, false);
        }

        this.m_table.saveToFile(this.m_binaryPath + '/binaries.csv');

        for (const binary of this.m_binaries) {
            const path = this.m_binaryPath + `/${binary.id}.bin`;
            if (fs.existsSync(path)) continue;

            fs.writeFileSync(path, binary.buffer);
        }

        this.hasChanges = false;
    }

    async promptImport() {
        const binaryPath = await ClientWindow.showOpenFileDialog(
            'Import Binary',
            ['All Files'],
            ['*.*'],
            1,
            null,
            null
        );
        if (binaryPath.length === 0) return;

        const stat = fs.statSync(binaryPath[0]);
        if (!stat) {
            ClientWindow.showErrorDialog('Import Binary', 'The specified file does not exist', null);
            return;
        }

        if (stat.type !== fs.FileType.Regular) {
            ClientWindow.showErrorDialog('Import Binary', 'The specified file is not a regular file', null);
            return;
        }

        const filename = path.basename(binaryPath[0]);

        const data = fs.readFileSync(binaryPath[0]);
        if (!data) {
            ClientWindow.showErrorDialog('Import Binary', 'Failed to read the specified file', null);
            return;
        }

        const id = BinaryManager.m_nextBinaryId++;
        this.m_table.push({ id, filename });

        this.m_binaries.push(new Binary(id, this.m_workspace, filename, data));
        this.hasChanges = true;
    }
}
