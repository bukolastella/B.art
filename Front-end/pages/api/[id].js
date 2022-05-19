// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.id;
  const name = `B.art wow #${tokenId}`;
  const description = "A collection of B.art";
  const image = `https://raw.githubusercontent.com/bukolastella/B.art/main/Front-end/public/${tokenId}.svg`;
  return res.json({ name, description, image });
}
