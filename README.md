# kms-vault

This kms-vault is encrypt/decrypt tool inspired by [ansible-vault](http://docs.ansible.com/ansible/playbooks_vault.html).

"ansible-vault" uses secret passphrase when encrypt/decrypt data.
"kms-vault" uses CMK that managed by [Amazon KMS](http://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) instead of secret passphrase , 

## Usage

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

### In Code

```
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


* kms-vault gen-datakey
* kms-vault encrypt
  * ファイルを指定して暗号化して上書き
  * 文字列を指定して暗号化して標準出力
* kms-vault decrypt
  * ファイルを指定して復号化して上書き
  * 文字列を指定して復号化して標準出力
* configの中で使えるように動機メソッドの提供
* kms-vault view
  * ファイルを復号化して標準出力

* kms-vault edit
  * ファイルを復号化してVIMで開く
* kms-vault reencrypt
  * 暗号化されたファイルを指定して復号化、再度暗号化
  * 暗号化された文字列を指定して復号化、最暗号化