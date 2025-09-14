import type { Workspace } from './workspace';

export class Binary extends DataView<ArrayBuffer> {
    private m_id: number;
    private m_workspace: Workspace;
    private m_filename: string;

    constructor(id: number, workspace: Workspace, filename: string, data: ArrayBuffer) {
        super(data);

        this.m_id = id;
        this.m_workspace = workspace;
        this.m_filename = filename;
    }

    get id() {
        return this.m_id;
    }

    get filename() {
        return this.m_filename;
    }
}
