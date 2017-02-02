import * as assert from "power-assert";
import * as mocha from "mocha";

import { Cipher } from "../src/cipher";
import { Config } from "../src/config";
import { DataKey } from "../src/datakey";

describe("Cipher", () => {
  const config: Config = {
    awsOpts: {
      region: "us-east-1"
    },
    kmsKeyAlias: "alias/forTest",
  };
  const PLAIN_STR = "plainString";
  const PLAIN_BYTES = new Buffer("plainData");

  describe("use DataKey", () => {
    let cipher:Cipher.Cipher;
    before(async () => {
      const dataKey = await DataKey.generate(config.kmsKeyAlias, config.awsOpts);
      cipher = new Cipher.Cipher(config, dataKey);
    });

    it("plainData is string", async () => {
      const encrypted = await cipher.encrypt(PLAIN_STR);
      assert(encrypted !== PLAIN_STR);
      assert(typeof encrypted === "string");
      const decrypted = await cipher.decrypt(encrypted);
      assert(decrypted === PLAIN_STR);
    });

    it("plainData is Buffer", async () => {
      const encrypted = await cipher.encrypt(PLAIN_BYTES);
      assert(encrypted !== PLAIN_BYTES);
      assert(Buffer.isBuffer(encrypted) === true);
      const decrypted = await cipher.decrypt(encrypted) as Buffer;
      assert(PLAIN_BYTES.equals(decrypted));
    });

  });

  describe("without DataKey", () => {
    const cipher = new Cipher.Cipher(config);
    it("plainData is string", async () => {
      const encrypted = await cipher.encrypt(PLAIN_STR);
      assert(encrypted !== PLAIN_STR);
      assert(typeof encrypted === "string");
      const decrypted = await cipher.decrypt(encrypted);
      assert(decrypted === PLAIN_STR);
    });

    it("plainData is Buffer", async () => {
      const encrypted = await cipher.encrypt(PLAIN_BYTES);
      assert(encrypted !== PLAIN_BYTES);
      assert(Buffer.isBuffer(encrypted) === true);
      const decrypted = await cipher.decrypt(encrypted) as Buffer;
      assert(PLAIN_BYTES.equals(decrypted));
    });

  });
});