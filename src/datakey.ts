import { KMS } from "aws-sdk";

export namespace DataKey {
  export async function generate(kmsKeyAlias:string, awsOpts?:KMS.ClientConfiguration):Promise<Buffer> {
    const kms = awsOpts ? new KMS(awsOpts) : new KMS();
    const result = await kms.generateDataKey({
      KeyId: kmsKeyAlias,
      KeySpec: "AES_256"
    }).promise();
    return result.CiphertextBlob as Buffer;
  }
}

