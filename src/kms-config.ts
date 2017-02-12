import { Cipher } from "./cipher";
import { spawnSync } from "child_process";
import { Config } from "./config";
import * as path from "path";

export namespace KmsConfig {
  //Wrapper for encrypted string in config file.
  export class Encrypted {
    constructor(public value: string) { }
  }

  export function encrypted(value: string) {
    return new Encrypted(value);
  }

  export class DecryptSync {
    constructor(private conf: Config) { }
    decryptSync(value: string) {
      const args = ["kms-vault", "-k", this.conf.kmsKeyAlias];
      if (this.conf.awsOpts && this.conf.awsOpts.region) {
        args.push("-r");
        args.push(this.conf.awsOpts.region);
      }
      args.push("decrypt");
      args.push(value);
      const r = spawnSync("node", args, { cwd: path.join(__dirname, "../bin") });
      if (r.error) {
        throw r.error;
      }
      if(r.status > 0) {
        throw new Error(r.stderr.toString());        
      }
      return r.stdout.toString().split(/\n|\r|\r\n/)[0];
    }
  }

  export async function decryptConfig(rawConf: Object): Promise<Object> {
    const vaultConfig = rawConf["kms-vault"];
    if (!vaultConfig) {
      throw new Error("\"kms-vault\" is required in your config file.");
    }
    const cipher = new Cipher.Cipher(vaultConfig);
    return await decryptEachAttrs(rawConf);

    async function decryptEachAttrs(obj: Object): Promise<Object> {
      const promises = Object.keys(obj).map(k => {
        const v = obj[k];
        if (typeof v === "object") {
          if (v instanceof Encrypted) {
            return cipher.decrypt((v as Encrypted).value);
          } else {
            return decryptEachAttrs(v);
          }
        } else {
          return Promise.resolve(v);
        }
      });
      const decryptedValues = await Promise.all(promises);
      Object.keys(obj).forEach((k, i) => {
        obj[k] = decryptedValues[i];
      });
      return obj;
    }
  }
}