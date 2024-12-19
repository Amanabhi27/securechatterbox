import * as openpgp from 'openpgp';

export async function generateKeyPair() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name: 'Anonymous', email: 'anonymous@example.com' }],
  });

  return { privateKey, publicKey };
}

export async function encryptMessage(message: string, publicKey: string) {
  const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
  
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: message }),
    encryptionKeys: publicKeyObj,
  });

  return encrypted;
}

export async function decryptMessage(encryptedMessage: string, privateKey: string) {
  const privateKeyObj = await openpgp.readPrivateKey({ armoredKey: privateKey });

  const message = await openpgp.readMessage({
    armoredMessage: encryptedMessage,
  });

  const decrypted = await openpgp.decrypt({
    message,
    decryptionKeys: privateKeyObj
  });

  return decrypted.data;
}