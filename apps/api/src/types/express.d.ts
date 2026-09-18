import { User, Session, Workspace, WorkspaceMember, WorkspaceRole, UserRole } from '@captionstudio/database';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        workspaceMembers: (WorkspaceMember & { workspace: Workspace })[];
      };
      session?: Session;
      workspace?: Workspace;
      membership?: WorkspaceMember;
    }
  }
}

