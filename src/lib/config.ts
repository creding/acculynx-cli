import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { UsageError } from "./errors.ts";

export interface CliConfig {
  apiKey?: string;
  signerEmail?: string;
  timeoutMs?: number;
  retryAttempts?: number;
}

function configPath(): string {
  const home = process.env.ACCULYNX_CONFIG_HOME || os.homedir();
  return path.join(home, ".config", "acculynx", "config.json");
}

/**
 * Optional config.json sitting next to the running bundle. Lets a deployment
 * ship credentials alongside the CLI file itself (e.g. a plugin's cli/ dir)
 * without any home-directory or env setup. Never committed — the file is
 * gitignored wherever the bundle lives in a repo.
 */
function bundleAdjacentConfigPath(): string | null {
  try {
    const script = fs.realpathSync(process.argv[1] ?? "");
    return path.join(path.dirname(script), "config.json");
  } catch {
    return null;
  }
}

function readJsonConfig(file: string | null): CliConfig {
  if (!file) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as CliConfig;
  } catch {
    return {};
  }
}

/** Merged config: home file wins over bundle-adjacent file; env vars win over both (see applyConfig). */
export function loadConfig(): CliConfig {
  return { ...readJsonConfig(bundleAdjacentConfigPath()), ...readJsonConfig(configPath()) };
}

/** Env wins; config file fills gaps. Applied to process.env so lib/acculynx.ts works unchanged. */
export function applyConfig(): void {
  const cfg = loadConfig();
  if (!process.env.ACCULYNX_API_KEY && cfg.apiKey) process.env.ACCULYNX_API_KEY = cfg.apiKey;
  if (!process.env.ACCULYNX_SIGNER_EMAIL && cfg.signerEmail) process.env.ACCULYNX_SIGNER_EMAIL = cfg.signerEmail;
  if (!process.env.ACCULYNX_TIMEOUT_MS && cfg.timeoutMs) process.env.ACCULYNX_TIMEOUT_MS = String(cfg.timeoutMs);
  if (!process.env.ACCULYNX_RETRY_ATTEMPTS && cfg.retryAttempts)
    process.env.ACCULYNX_RETRY_ATTEMPTS = String(cfg.retryAttempts);
}

export function requireApiKey(): void {
  if (!process.env.ACCULYNX_API_KEY) {
    throw new UsageError(
      "ACCULYNX_API_KEY is not set.",
      'Export it (export ACCULYNX_API_KEY=...) or add {"apiKey": "..."} to ~/.config/acculynx/config.json.',
    );
  }
}
