# kms-vault

This kms-vault is encrypt/decrypt tool inspired by [ansible-vault](http://docs.ansible.com/ansible/playbooks_vault.html).

"ansible-vault" uses secret passphrase when encrypt/decrypt data.
"kms-vault" uses CMK that managed by [Amazon KMS](http://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) instead of secret passphrase , 

## Usage

### Instalation

```
$ npm install kms-vault
```

### Commandline

```
$ $(npm bin)/kms-vault 

  Usage: kms-vault [options] [command]

  Commands:

    decrypt [encryptedBase64String]  encrypted base64 string to plain string use CMK.
    encrypt [plainStr]               plain string to encrypted base64 use CMK
    datakey                          generate datakey use CMK

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -r, --region <region>    AWS_REGION(default is `us-east-1`)
    -k, --key [kmsKeyAlias]  KMS CMK alias name
```

```
$ $(npm bin)/kms-vault -k alias/forTest encrypt somePassword
AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDCJgX/XbBNkM1kifLwIBEIAnKfV3M+OeH9ErdYUZxYN09EY9vD0HvTH+P9bOTrjNGKKWzTQ2D1wV

$ $(npm bin)/kms-vault -k alias/forTest decrypt AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDCJgX/XbBNkM1kifLwIBEIAnKfV3M+OeH9ErdYUZxYN09EY9vD0HvTH+P9bOTrjNGKKWzTQ2D1wV
somePassword
```

### Decrypt encrypted config value in your code (async with Promise)

index.js
```js
const co = require("co");
const KmsConfig = require("kms-vault").KmsConfig;

co(function* () {
  const cfg = yield KmsConfig.decryptConfig(require("config"));
  console.log(cfg);
}).then(r => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
```

config/default.js
```js
"use strict";
const encrypted = require("kms-vault").KmsConfig.encrypted;

module.exports = {
  db: {
    user: "hogehoge",
    password: encrypted("AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDBHdBm6J8K2A4rKkXAIBEIAnni4TuIRTjGUlmVVgXoXlVRnVBgeqsYD3p+i9HvuqPt7FmbMPx+3V")
  },
  "kms-vault": {
    awsOpts: {
      region: "us-east-1"
    },
  }
}
```

### Decrypt encrypted config value in your code (sync)

```js
"use strict";
const KmsConfig = require("kms-vault").KmsConfig;
const d = new KmsConfig.DecryptSync({
  awsOpts: {
    region: "us-east-1"
  }
});

const decryptedString = d.decryptSync("AQECAHhyvC+4FgLo7XdXfh5o6JgnT/l9P+Sq+EPVjq7mGLAIIwAAAGowaAYJKoZIhvcNAQcGoFswWQIBADBUBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDBHdBm6J8K2A4rKkXAIBEIAnni4TuIRTjGUlmVVgXoXlVRnVBgeqsYD3p+i9HvuqPt7FmbMPx+3V");
console.log(decryptedString);
```