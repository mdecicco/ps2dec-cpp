import * as React from 'mini-react';

import { WorkspaceManager } from '@app/managers/workspace-mgr';
import { Workspace } from '@app/types/workspace';

type WorkspaceContext = {
    workspace: Workspace | null;
};

const WorkspaceContext = React.createContext<WorkspaceContext>();
WorkspaceContext.Provider.displayName = 'WorkspaceContext';

export const WorkspaceProvider: React.FC = props => {
    const wm = WorkspaceManager.get();
    const [workspace, setWorkspace] = React.useState<Workspace | null>(wm.getWorkspace());

    React.useEffect(() => {
        const l = wm.addListener('workspaceChanged', setWorkspace);
        return () => l.remove();
    }, []);

    return <WorkspaceContext.Provider value={{ workspace }}>{props.children}</WorkspaceContext.Provider>;
};

export function useWorkspace() {
    const ctx = React.useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspace must be used within a WorkspaceProvider');

    const [hasChanges, setHasChanges] = React.useState(ctx.workspace?.hasChanges ?? false);

    React.useEffect(() => {
        if (!ctx.workspace) return;
        const l = ctx.workspace.addListener('dirtyStateChange', setHasChanges);
        return () => l.remove();
    }, [ctx.workspace]);

    const openWorkspace = () => {
        WorkspaceManager.get().openWorkspace();
    };

    const saveWorkspace = () => {
        if (!ctx.workspace) return;
        ctx.workspace.save();
    };

    const importBinary = () => {
        if (!ctx.workspace) return;
        ctx.workspace.binaries.promptImport();
    };

    return { workspace: ctx.workspace, workspaceHasChanges: hasChanges, openWorkspace, saveWorkspace, importBinary };
}
