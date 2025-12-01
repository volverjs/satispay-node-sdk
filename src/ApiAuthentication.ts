/**
 * ApiAuthentication class for storing authentication keys
 */
export class ApiAuthentication {
  public privateKey: string
  public publicKey: string
  public keyId: string

  constructor(privateKey: string, publicKey: string, keyId: string) {
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.keyId = keyId
  }
}
