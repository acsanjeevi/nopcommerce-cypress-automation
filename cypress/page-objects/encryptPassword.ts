import * as cryptoJs from 'crypto-js';

export function encryptPasswordSync(plainTextPassword: string): string {
  const secretKey = Cypress.env('encryptionKey');
  if (!secretKey) {
    throw new Error('Encryption key missing. Set CYPRESS_ENCRYPTION_KEY in secured.env');
  }
  const encrypted = cryptoJs.AES.encrypt(plainTextPassword, secretKey).toString();
  cy.log('Password encrypted successfully');
  return encrypted;
}

export function decryptPasswordSync(encryptedPassword: string): string {
  const secretKey = Cypress.env('encryptionKey');
  if (!secretKey) {
    throw new Error('Encryption key missing. Set CYPRESS_ENCRYPTION_KEY in secured.env');
  }
  const bytes = cryptoJs.AES.decrypt(encryptedPassword, secretKey);
  const decrypted = bytes.toString(cryptoJs.enc.Utf8);
  if (!decrypted) {
    throw new Error('Decryption failed. Verify encryption key and ciphertext.');
  }
  return decrypted;
}
