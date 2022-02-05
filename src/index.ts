import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const port = parseInt(<string>process.env.PORT, 10) || 3002;

const SECRET =
  "The most beautiful thing about the future is that it comes one day at a time.";

const algorithm = "aes-256-ctr";
const secretKey = crypto
  .createHash("sha256")
  .update(String(SECRET))
  .digest("base64")
  .substr(0, 32);

interface IEncrypted {
  txId: string;
  key: string;
}

const encrypt = (text: Record<string, any>): IEncrypted => {
  const body = JSON.stringify(text);
  const txId = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, txId);

  const encrypted = Buffer.concat([cipher.update(body), cipher.final()]);

  return {
    txId: txId.toString("hex"),
    key: encrypted.toString("hex"),
  };
};

const decrypt = (hash: IEncrypted): Record<string, any> => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.txId, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.key, "hex")),
    decipher.final(),
  ]);

  return JSON.parse(decrpyted.toString());
};

app.post(`/encrypt`, async (req, res) => {
  try {
    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).send("No body");
    }

    const result = encrypt(body);

    res.json(result);
  } catch (error: any) {
    res.status(500).send({
      statusCode: 500,
      message: error?.message,
      error,
    });
  }
});

app.post(`/decrypt`, async (req, res) => {
  try {
    const { body } = req;

    if (!body || !body.txId || !body.key) {
      return res.status(400).send("Invalid request");
    }

    const result = decrypt(body);

    res.json(result);
  } catch (error: any) {
    res.status(500).send({
      statusCode: 500,
      message: "Invalid key",
      error,
    });
  }
});

app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
);
