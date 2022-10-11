import { IncomingMessage } from "node:http";
import { get as nodeGet } from "node:https";

export function httpGet(url: string) {
  return new Promise<Response>((resolve, reject) => {
    nodeGet(url, (res) => {
      resolve(new Response(res));
    }).on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Imitate Fetch API's Response class.
 * https://developer.mozilla.org/ja/docs/Web/API/Response
 */
class Response {
  constructor(private res: IncomingMessage) {}

  get status() {
    return this.res.statusCode;
  }

  get ok() {
    const stat = this.status;
    return stat != null && stat >= 200 && stat < 300;
  }

  json<T = unknown>() {
    return new Promise<T>((resolve, reject) => {
      let buf = "";
      this.res.setEncoding("utf-8");
      this.res.on("data", (chunk) => (buf += chunk));
      this.res.on("end", () => resolve(JSON.parse(buf)));
      this.res.on("error", () => reject(this.res));
    });
  }
}
