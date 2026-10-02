import { Sandbox } from "@vercel/sandbox";

import { parseError } from "@/lib/error";
import { getSandboxCredentials } from "@/lib/sandbox";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const createSandbox = async (
  repoFullName: string,
  token: string,
  branch: string
): Promise<string> => {
  "use step";

  try {
    const sandbox = await Sandbox.create({
      ...getSandboxCredentials(),
      source: {
        depth: 1,
        password: token,
        revision: branch,
        type: "git",
        url: `https://github.com/${repoFullName}.git`,
        username: "x-access-token",
      },
      timeout: FIVE_MINUTES_MS,
    });

    return sandbox.sandboxId;
  } catch (error) {
    throw new Error(`Failed to create sandbox: ${parseError(error)}`, {
      cause: error,
    });
  }
};
