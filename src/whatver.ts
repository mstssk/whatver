import { spawn } from "child_process";
import { URL } from "url";
import fetch from "node-fetch";

const DEFAULT_REPO =
  "https://raw.githubusercontent.com/mstssk/whatver-repo/master";

if (process.argv[2]) {
  main(process.argv[2]).catch((reason) => {
    console.error(reason.message);
    process.exit(1);
  });
} else {
  console.error("missing <command>");
  process.exit(1);
}

/**
 * @param {string} command
 */
async function main(command: string) {
  command = sanitizeCommand(command);
  const url = resolveUrl(command);
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(buildContributionMessage(command));
    } else {
      throw new Error(`${res.status} : ${url}`);
    }
  }
  const { verarg } = await res.json();
  if (!verarg) {
    throw new Error("missing verarg");
  }
  const cmd = spawn(command, [verarg], { stdio: "inherit" });
  cmd.on("close", (code) => process.exit(code));
}

function sanitizeCommand(command: string) {
  return command; // FIXME
}

/**
 * @param {string} command
 * @returns {string} url
 */
function resolveUrl(command: string): string {
  const repo = DEFAULT_REPO;
  return `${repo}/data/${command}.json`;
}

/**
 * @param {string} command
 * @returns {string} message
 */
function buildContributionMessage(command: string): string {
  const filename = `${command}.json`;
  const url = new URL(
    "https://github.com/mstssk/whatver-repo/new/master/data/"
  );
  url.pathname += filename;
  url.searchParams.append("filename", filename);
  url.searchParams.append("value", JSON.stringify({ verarg: "" }));
  const msg = `No entry for '${command}'. Please contribute to version args repository from below link:
${url.toString()}
`;
  return msg;
}
