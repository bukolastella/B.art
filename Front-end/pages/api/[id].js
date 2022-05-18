// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.id;
  const name = `B.art #${tokenId}`;
  const description = "A collection of B.art";
  const image = res.status(200).json({ name: "John Doe" });
}
