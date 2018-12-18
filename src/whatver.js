const https = require('https');
const { spawn } = require('child_process');

const DEFAULT_REPO = "https://raw.githubusercontent.com/mstssk/whatver-repo/master";

if (process.argv.length < 3) {
    console.error('missing <command>');
    process.exit(2);
} else {
    main(process.argv[2]);
}


/**
 * @param {string} command
 */
async function main(command) {
    command = sanitizeCommand(command);
    const verArg = await resolveVerArg(command);
    const cmd = spawn(command, [verArg]);
    cmd.stdout.on('data', data => console.log(data.toString('utf8').trim()));
    cmd.stderr.on('data', data => console.error(data.toString('utf8').trim()));
    cmd.on('close', code => process.exit(code));
}

function sanitizeCommand(command) {
    return command; // FIXME
}

/**
 * @param {string} command
 * @returns {string} verArg
 */
async function resolveVerArg(command) {
    // TODO result cache
    const url = resolveUrl(command);
    const responseBody = await httpsGet(url);
    const result = JSON.parse(responseBody);
    if (!result['verarg']) {
        throw new Error('missing verarg');
    }
    return result['verarg'];
}

/**
 * @param {string} command
 * @returns {string} url
 */
function resolveUrl(command) {
    const repo = DEFAULT_REPO;
    return `${repo}/data/${command}.json`;
}

/**
 * @param {string} url
 * @returns {Promise<string>} result
 */
function httpsGet(url) {
    return new Promise((resolve, rejetct) => {
        https.get(url, res => {
            if (res.statusCode != 200) {
                throw new Error(`${res.statusCode} : ${url}`);
            }
            let result = "";
            res.setEncoding("utf8");
            res.on('data', chunk => result += chunk);
            res.on("end", () => resolve(result));
        }).on("error", e => {
            rejetct(e);
        });
    })
}