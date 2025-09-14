import { ClientWindow } from 'client-window';
import { EventProducer } from 'event';
import * as fs from '__internal:fs';

import { Workspace } from '@app/types/workspace';

type WorkspaceEvents = {
    workspaceChanged: (newWorkspace: Workspace) => void;
};

export class WorkspaceManager extends EventProducer<WorkspaceEvents> {
    private static m_instance: WorkspaceManager | null = null;
    private m_workspace: Workspace | null;

    private constructor() {
        super();

        this.m_workspace = null;
    }

    static get() {
        if (!this.m_instance) throw new Error('WorkspaceManager is not initialized');
        return this.m_instance;
    }

    static initialize() {
        if (this.m_instance) throw new Error('WorkspaceManager is already initialized');
        this.m_instance = new WorkspaceManager();
    }

    static shutdown() {
        if (!this.m_instance) throw new Error('WorkspaceManager is not initialized');
        this.m_instance = null;
    }

    getWorkspace(): Workspace | null {
        return this.m_workspace;
    }

    async openWorkspace() {
        if (this.m_workspace && this.m_workspace.hasChanges) {
            const result = await ClientWindow.showConfirmationDialog(
                'Open Workspace',
                'Are you sure you want to open this workspace? Any unsaved changes will be lost.',
                null
            );

            if (!result) return;
        }

        const dir = await ClientWindow.showOpenDirectoryDialog('Open Workspace', null, null);

        if (dir.length === 0) return;

        if (this.m_workspace && this.m_workspace.path === dir) return;

        const stat = fs.statSync(dir);
        if (!stat) {
            ClientWindow.showErrorDialog('Open Workspace', 'The specified directory does not exist', null);
            return;
        }

        if (stat.type !== fs.FileType.Directory) {
            ClientWindow.showErrorDialog('Open Workspace', 'The specified path is not a directory', null);
            return;
        }

        this.m_workspace = new Workspace(dir);
        this.dispatch('workspaceChanged', this.m_workspace);

        this.m_workspace.initialize();
    }
}
