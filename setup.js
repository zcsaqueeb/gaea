const { loadData, decodeJWT } = require("./utils");
const fs = require("fs");
const crypto = require("crypto");

(async () => {
  async function main() {
    try {
      // Load tokens from the text file
      const tokens = loadData("tokens.txt");

      // Load accounts from JSON file
      const accounts = require("./accounts.json");

      let newData = [];

      for (const token of tokens) {
        let data = {};
        const { decodedPayload } = decodeJWT(token);

        const isExpired = Date.now() / 1000 >= decodedPayload.expire;

        const account = accounts.find((a) => a.userid === decodedPayload.userid);

        if (account) {
          data = {
            ...account,
            Token: token,
            expire: decodedPayload.expire,
            isExpired,
          };
        } else {
          data = {
            userid: decodedPayload.userid,
            Token: token,
            Browser_ID: crypto.randomUUID(),
            expire: decodedPayload.expire,
            isExpired,
          };
        }

        newData.push(data);
      }

      // Write the new data to accounts.json
      fs.writeFileSync("accounts.json", JSON.stringify(newData, null, 2), "utf-8");
      console.log("Data saved to accounts.json".green);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  await main(); // Ensure to await the main function
})();
