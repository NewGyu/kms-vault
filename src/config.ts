import { KMS } from "aws-sdk";

export interface Config {
  awsOpts?: KMS.ClientConfiguration;
  kmsKeyAlias: string;
  encryptContext?: KMS.EncryptionContextType;
  dataKeyString?: string;
}
