import https from "https";
import { spawn } from "child_process";

const DEFAULT_REPO =
  "https://raw.githubusercontent.com/mstssk/whatver-repo/master";

if (process.argv[2]) {
  main(process.argv[2]);
} else {
  console.error("missing <command>");
  process.exit(2);
}

/**
 * @param {string} command
 */
async function main(command: string) {
  command = sanitizeCommand(command);
  const verArg = await resolveVerArg(command);
  const cmd = spawn(command, [verArg], { stdio: "inherit" });
  cmd.on("close", (code) => process.exit(code));
}

function sanitizeCommand(command: string) {
  return command; // FIXME
}

/**
 * @param {string} command
 * @returns {string} verArg
 */
async function resolveVerArg(command: string) {
  // TODO result cache
  const url = resolveUrl(command);
  const responseBody = await httpsGet(url, command);
  const result = JSON.parse(responseBody);
  if (!result["verarg"]) {
    throw new Error("missing verarg");
  }
  return result["verarg"];
}

/**
 * @param {string} command
 * @returns {string} url
 */
function resolveUrl(command: string) {
  const repo = DEFAULT_REPO;
  return `${repo}/data/${command}.json`;
}

/**
 * @param {string} url
 * @deprecated @param {string} command
 * @returns {Promise<string>} result
 */
function httpsGet(url: string, command: string) {
  return new Promise<string>((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode != 200) {
          if (res.statusCode === 404) {
            console.error(buildContributionMessage(command));
          }
          throw new Error(`${res.statusCode} : ${url}`);
        }
        let result = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (result += chunk));
        res.on("end", () => resolve(result));
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}

/**
 * @param {string} command
 * @returns {string} message
 */
function buildContributionMessage(command: string) {
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
