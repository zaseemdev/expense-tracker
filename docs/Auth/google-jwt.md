# Google Authentication Setup

This guide explains how to:

1. Generate a JWT private key
2. Configure the private key in Convex
3. Generate a public JWKS
4. Configure the JWKS in Convex

---

## 1. Generate JWT Private Key

Create a secrets directory:

```bash
mkdir -p ~/.secrets
```

Generate a 2048-bit RSA private key:

```bash
openssl genpkey -algorithm RSA \
  -out ~/.secrets/jwt_private_key.pem \
  -pkeyopt rsa_keygen_bits:2048
```

---

## 2. Set the Private Key in Convex

Store the private key as an environment variable:

```bash
npx convex env set JWT_PRIVATE_KEY="$(cat ~/.secrets/jwt_private_key.pem)"
```

---

## 3. Generate the Public JWKS

Create a temporary Node.js project:

```bash
mkdir ~/temp-jwks
cd ~/temp-jwks
npm init -y
npm install jose
```

---

### Create `generate-jwks.mjs`

```js
import { readFileSync } from "fs"
import { importPKCS8, exportJWK } from "jose"
import { createPublicKey } from "crypto"

const privateKeyPem = readFileSync(
  process.env.HOME + "/.secrets/jwt_private_key.pem",
  "utf8"
)

// Validate private key
await importPKCS8(privateKeyPem, "RS256")

// Create public key
const publicKey = createPublicKey(privateKeyPem)

// Export public key as JWK
const publicJwk = await exportJWK(publicKey)

const jwks = {
  keys: [
    {
      ...publicJwk,
      use: "sig",
      alg: "RS256",
      kid: "main-key"
    }
  ]
}

console.log(JSON.stringify(jwks))
```

---

### Run the script

```bash
node generate-jwks.mjs
```

Copy the generated JSON output.

---

## 4. Set the JWKS in Convex

```bash
npx convex env set JWKS='<paste_generated_json_here>'
```

---

## 5. Add Private Key to macOS Keychain (Optional but Recommended)

Store the private key securely in your macOS Keychain:

```bash
security add-generic-password \
  -a "$USER" \
  -s "JWT_PRIVATE_KEY" \
  -w "$(cat ~/.secrets/jwt_private_key.pem)"
```

This stores the private key in the login Keychain under the name `JWT_PRIVATE_KEY`.

---

## 6. Clean Up Temporary Files

After successfully setting the environment variables and storing the key in the Keychain, remove temporary files:

Remove the temporary JWKS project:

```bash
rm -rf ~/temp-jwks
```

Remove the local private key file:

```bash
rm -f ~/.secrets/jwt_private_key.pem
```

If the `~/.secrets` directory is empty, you may remove it:

```bash
rmdir ~/.secrets
```

---

## Result

You have now configured:

* `JWT_PRIVATE_KEY`
* `JWKS`

The private key is securely stored in the Keychain, and temporary files have been removed.
