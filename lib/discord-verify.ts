import nacl from 'tweetnacl'

export function verifyDiscordRequest(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKey: string
): boolean {
  if (!signature || !timestamp) return false

  try {
    return nacl.sign.detached.verify(
      new Uint8Array(Buffer.from(timestamp + rawBody)),
      new Uint8Array(Buffer.from(signature, 'hex')),
      new Uint8Array(Buffer.from(publicKey, 'hex'))
    )
  } catch {
    return false
  }
}
