import { Sandbox } from "@vercel/sandbox";

import { parseError } from "@/lib/error";
import { getSandboxCredentials } from "@/lib/sandbox";

export const stopSandbox = async (sandboxId: string): Promise<void> => {
  "use step";

  let sandbox: Sandbox | null = null;

  try {
    sandbox = await Sandbox.get({ sandboxId, ...getSandboxCredentials() });
  } catch (error) {
    throw new Error(
      `[stopSandbox] Failed to get sandbox: ${parseError(error)}`,
      { cause: error }
    );
  }

  try {
    await sandbox.stop();
  } catch (error) {
    throw new Error(`Failed to stop sandbox: ${parseError(error)}`, {
      cause: error,
    });
  }
};
