import * as Commander from "commander";
import { Cipher } from "./cipher";
import { Config } from "./config";
import { DataKey } from "./datakey";

export function kmsVault(argv: string[], config?: Config) {
  Commander.version("0.1.0")
    .option("-r, --region <region>", "AWS_REGION(default is `us-east-1`)")
    .option("-k, --key [kmsKeyAlias]", "KMS CMK alias name");

  Commander.command("decrypt [encryptedBase64String]")
    .description("decrypt encrypted base64 string ")
    .action((encryptedBase64String, options) => {
      config = config || createConfigFromArgs(options);
      const cipher = new Cipher.Cipher(config);
      cipher.decrypt(encryptedBase64String)
        .then(plainStr => {
          console.log(plainStr);
          process.exit(0);
        })
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    });

  Commander.command("encrypt")
    .description("encrypt plain string to encrypted base64")
    .arguments("[plainStr]")
    .action((plainStr, options) => {
      config = config || createConfigFromArgs(options);
      const cipher = new Cipher.Cipher(config);
      cipher.encrypt(plainStr)
        .then(encrypted => {
          console.log(encrypted);
          process.exit(0);
        })
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    });

  Commander.command("datakey")
    .description("generate datakey use CMK")
    .action((options) => {
      config = config || createConfigFromArgs(options);
      DataKey.generate(config.kmsKeyAlias, config.awsOpts)
        .then((blob) => {
          console.log(blob.toString("base64"));
          process.exit(0);
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        });
    });
  //to display "help" when no args
  if (argv.length < 3) argv.push("--help");
  Commander.parse(argv);
}

function createConfigFromArgs(options: any) {
  return {
    kmsKeyAlias: options.parent.key,
    awsOpts: {
      region: options.parent.region || "us-east-1"
    }
  };
}