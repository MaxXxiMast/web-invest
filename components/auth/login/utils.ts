export async function encryptValue(value, key) {

  if (!key || typeof key !== 'string') {
    return;
  }
    // Convert PEM to ArrayBuffer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = key
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
    const binaryDerString = window.atob(pemContents);
    const binaryDer = new Uint8Array(
      Array.from(binaryDerString, char => char.charCodeAt(0))
    );

    // Import the public key
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    // Encrypt the message
    const encoded = new TextEncoder().encode(value);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      encoded
    );

    // Return base64 string
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted))));
  }