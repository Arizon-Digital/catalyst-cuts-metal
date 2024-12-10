import { execSync } from 'child_process';

import { checkoutRef } from './checkout-ref';
import { hasGitHubSSH } from './has-github-ssh';
import { resetBranchToRef } from './reset-branch-to-ref';

export const cloneCatalyst = ({
  repository,
  projectName,
  projectDir,
  ghRef,
  resetMain = false,
}: {
  repository: string;
  projectName: string;
  projectDir: string;
  ghRef?: string;
  resetMain?: boolean;
}) => {
  const useSSH = hasGitHubSSH();

  console.log(`Cloning ${repository} using ${useSSH ? 'SSH' : 'HTTPS'}...\n`);

  const cloneCommand = `git clone ${
    useSSH ? `git@github.com:${repository}` : `https://github.com/${repository}`
  }.git${projectName ? ` ${projectName}` : ''}`;

  execSync(cloneCommand, { stdio: 'inherit' });
  console.log();

  execSync('git remote rename origin upstream', { cwd: projectDir, stdio: 'inherit' });
  console.log();

  if (ghRef) {
    if (resetMain) {
      try {
        resetBranchToRef(projectDir, 'main', ghRef);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('Unknown error occurred while resetting branch to ref');
        }
      }
      return;
    }

    try {
      checkoutRef(projectDir, ghRef);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Unknown error occurred while checking out ref');
      }
    }

    console.log();
  }
};
