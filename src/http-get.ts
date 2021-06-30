import { get } from "https";

export function httpGet(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers["content-type"] ?? "";

      let error;
      if (statusCode !== 200) {
        error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(
          "Invalid content-type.\n" +
            `Expected application/json but received ${contentType}`
        );
      }
      if (error) {
        console.error(error.message);
        res.resume(); // Consume response data to free up memory
        return;
      }

      res.setEncoding("utf8");
      let rawData = "";
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => resolve(rawData));
    }).on("error", (e) => {
      reject(e);
    });
  });
}
