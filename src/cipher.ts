import { Config } from "./config";
import { KMS } from "aws-sdk";
import { createCipher, createDecipher } from "crypto";
import { Readable, Writable } from "stream";

const ALG = "aes-256-cbc";

export namespace Cipher {
  export type Base64String = string;
  export type PlainData = string | Buffer;
  export type CipherData = Base64String | Buffer;

  export class Cipher {
    private KMS: KMS;

    constructor(private config: Config, private cipherDataKey?: KMS.CiphertextType) {
      this.KMS = config.awsOpts ? new KMS(config.awsOpts) : new KMS();
    }

    async encrypt(plainData: PlainData): Promise<CipherData> {
      if (!this.cipherDataKey) {
        return await this.encryptDataUseCmkDirectly(plainData);
      } else {
        return await this.encryptDataUseDataKey(plainData, this.cipherDataKey);
      }
    }

    async encryptStream(plainData: Readable, outTo: Writable) {
      if (!this.cipherDataKey)
        throw new Error("cipherDataKey is required!");

      const dk = await this.decryptUseCMK(this.cipherDataKey);
      const cipher = createCipher(ALG, dk);
      plainData.pipe(cipher).pipe(outTo);
    }

    private async encryptDataUseCmkDirectly(plainData: PlainData) {
      const cipherData = await this.encryptUseCMK(plainData);
      if (typeof plainData === "string") {
        return cipherData.toString("base64");
      } else {
        return cipherData;
      }
    }

    private async encryptDataUseDataKey(plainData: PlainData, dataKey: KMS.CiphertextType) {
      const dk = await this.decryptUseCMK(dataKey);
      const cipher = createCipher(ALG, dk);
      if (typeof plainData === "string") {
        let str = cipher.update(plainData, "utf8", "base64");
        str += cipher.final("base64");
        return str;
      } else if (Buffer.isBuffer(plainData)) {
        const buff = cipher.update(plainData);
        return Buffer.concat([buff, cipher.final()]);
      }
      throw new Error("Unknown Type");

    }

    private async encryptUseCMK(plainData: PlainData): Promise<Buffer> {
      const d = Buffer.isBuffer(plainData) ? plainData : new Buffer(plainData, "utf8");
      const r = await this.KMS.encrypt({
        KeyId: this.config.kmsKeyAlias,
        EncryptionContext: this.config.encryptContext,
        Plaintext: d
      }).promise();
      return r.CiphertextBlob as Buffer;
    }

    async decrypt(cipherData: CipherData): Promise<PlainData> {
      if (!this.cipherDataKey) {
        return await this.decryptDataUseCmkDirectly(cipherData);
      } else {
        return await this.decryptDataUseDataKey(cipherData, this.cipherDataKey);
      }
    }

    async decryptStream(cipherData: Readable, outTo: Writable) {
      if (!this.cipherDataKey)
        throw new Error("cipherDataKey is required!");

      const dk = await this.decryptUseCMK(this.cipherDataKey);
      const decipher = createDecipher(ALG, dk);
      cipherData.pipe(decipher).pipe(outTo);
    }

    private async decryptDataUseCmkDirectly(cipherData: CipherData) {
      const plainData = await this.decryptUseCMK(cipherData);
      if (typeof cipherData === "string") {
        return plainData.toString("utf8");
      } else {
        return plainData;
      }
    }

    private async decryptDataUseDataKey(cipherData: CipherData, dataKey: KMS.CiphertextType) {
      const dk = await this.decryptUseCMK(dataKey);
      const decipher = createDecipher(ALG, dk);
      if (typeof cipherData === "string") {
        let str = decipher.update(cipherData, "base64", "utf8");
        str += decipher.final("utf8");
        return str;
      } else if (Buffer.isBuffer(cipherData)) {
        const buff = decipher.update(cipherData);
        return Buffer.concat([buff, decipher.final()]);
      }
      throw new Error("Unknown Type");

    }

    private async decryptUseCMK(cipherData: KMS.CiphertextType): Promise<Buffer> {
      const d = Buffer.isBuffer(cipherData) ? cipherData : new Buffer(cipherData as string, "base64");
      const r = await this.KMS.decrypt({
        CiphertextBlob: d,
        EncryptionContext: this.config.encryptContext
      }).promise();
      return r.Plaintext as Buffer
    }
  }
}
