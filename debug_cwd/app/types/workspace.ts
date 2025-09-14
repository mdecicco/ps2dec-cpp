import { EventProducer } from 'event';

import { BinaryManager } from '@app/managers/binary-mgr';

type WorkspaceEvents = {
    dirtyStateChange: (hasChanges: boolean) => void;
};

export class Workspace extends EventProducer<WorkspaceEvents> {
    private m_path: string;
    private m_name: string;
    private m_hasChanges: boolean;
    private m_binaries: BinaryManager;

    constructor(path: string) {
        super();
        this.m_path = path;
        this.m_name = path.split('/').pop() ?? 'Workspace';
        this.m_hasChanges = false;
        this.m_binaries = new BinaryManager(`${this.m_path}/binaries`, this);

        this.m_binaries.addListener('dirtyStateChange', hasChanges => {
            this.hasChanges = hasChanges;
        });
    }

    get path() {
        return this.m_path;
    }

    get name() {
        return this.m_name;
    }

    get binaries() {
        return this.m_binaries;
    }

    get hasChanges() {
        return this.m_hasChanges;
    }

    set hasChanges(hasChanges: boolean) {
        if (this.m_hasChanges === hasChanges) return;
        this.m_hasChanges = hasChanges;
        this.dispatch('dirtyStateChange', hasChanges);
    }

    initialize() {
        this.m_binaries.load();
    }

    save() {
        if (!this.m_hasChanges) return;

        this.m_binaries.save();

        this.hasChanges = false;
    }
}
