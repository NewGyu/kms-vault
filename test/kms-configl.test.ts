import * as assert from "power-assert";
import * as mocha from "mocha";

import { KmsConfig } from "../src/kms-config";

describe("KmsConfig", () => {
  it("when not exists 'kms-vault'", async () => {
    const config = {
      key1: {
        nested1: {
          nested2: KmsConfig.encrypted("encrypted")
        }
      }
    }
    try {
      const decrypted = await KmsConfig.decryptConfig(config);
      assert.fail();
    } catch (err) {
      assert(err.message === "\"kms-vault\" is required in your config file.");
    }
  });

  it("decryptConfig", async () => {
    const config = {
      "kms-vault": {
        awsOpts: { region: "us-east-1" },
        kmsKeyAlias: "alias/forTest"
      },
      key1: {
        nested1: {
          nested2: KmsConfig.encrypted("AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDMTv1T7VHWlguLlDVgIBEIAnKO1NuPfJ2ib5oP4m3gMSB39qOyWkSq55+kofRICd2v8yH9khC46a")
        }
      },
      key2: KmsConfig.encrypted("AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDMTv1T7VHWlguLlDVgIBEIAnKO1NuPfJ2ib5oP4m3gMSB39qOyWkSq55+kofRICd2v8yH9khC46a")
    }
    const decrypted = await KmsConfig.decryptConfig(config);
    assert.deepEqual(decrypted, {
      "kms-vault": {
        awsOpts: { region: "us-east-1" },
        kmsKeyAlias: "alias/forTest"
      },
      key1: {
        nested1: {
          nested2: "originString"
        }
      },
      key2: "originString"
    });
  });

  it("decryptSync", () => {
    const DecryptSync = new KmsConfig.DecryptSync({
      kmsKeyAlias: "alias/forTest",
      awsOpts: { region: "us-east-1" }
    });

    const decrypted = DecryptSync.decryptSync("AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDMTv1T7VHWlguLlDVgIBEIAnKO1NuPfJ2ib5oP4m3gMSB39qOyWkSq55+kofRICd2v8yH9khC46a");
    assert(decrypted === "originString");
  });
});