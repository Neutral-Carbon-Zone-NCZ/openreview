interface SandboxCredentials {
  projectId?: string;
  teamId?: string;
  token?: string;
}

/**
 * Explicit Vercel credentials for `@vercel/sandbox`, used when running outside
 * Vercel (e.g. Railway) where no OIDC token is available. Returns an empty
 * object unless all three env vars are set, so on Vercel the SDK keeps using
 * its OIDC context.
 */
export const getSandboxCredentials = (): SandboxCredentials => {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!(token && teamId && projectId)) {
    return {};
  }

  return { projectId, teamId, token };
};
