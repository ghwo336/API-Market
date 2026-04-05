import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedApis = [
  {
    name: "Weather API",
    description:
      "Get real-time weather data for any city worldwide. Returns temperature, humidity, wind speed, and weather conditions.",
    endpoint: "https://api.example.com/weather",
    price: "10000000000000000",
    category: "data",
    sellerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    status: "APPROVED" as const,
    onChainId: 1,
    exampleRequest: { city: "Seoul", unit: "celsius" },
    exampleResponse: {
      temperature: 23,
      humidity: 65,
      wind_speed: 12,
      condition: "Partly Cloudy",
    },
  },
  {
    name: "GPT Summarizer",
    description:
      "Summarize any text using GPT-4. Supports articles, papers, and documents up to 10,000 words.",
    endpoint: "https://api.example.com/summarize",
    price: "50000000000000000",
    category: "ai",
    sellerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    status: "APPROVED" as const,
    onChainId: 2,
    exampleRequest: { text: "Long article text here...", max_length: 200 },
    exampleResponse: {
      summary: "This article discusses the impact of AI on...",
      word_count: 45,
    },
  },
  {
    name: "Token Price Oracle",
    description:
      "Fetch real-time token prices from multiple DEXs on Monad. Supports MON, USDC, WETH, and 50+ tokens.",
    endpoint: "https://api.example.com/price",
    price: "5000000000000000",
    category: "finance",
    sellerAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    status: "APPROVED" as const,
    onChainId: 3,
    exampleRequest: { token: "MON", quote: "USDC" },
    exampleResponse: { price: 2.45, volume_24h: 15000000, change_24h: 3.2 },
  },
  {
    name: "Image Generation API",
    description:
      "Generate images from text prompts using Stable Diffusion XL. Returns high-quality 1024x1024 images.",
    endpoint: "https://api.example.com/generate-image",
    price: "100000000000000000",
    category: "ai",
    sellerAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    status: "APPROVED" as const,
    onChainId: 4,
    exampleRequest: {
      prompt: "A futuristic city on Monad blockchain",
      style: "digital art",
    },
    exampleResponse: {
      image_url: "https://example.com/generated/abc123.png",
      seed: 42,
    },
  },
  {
    name: "Sentiment Analysis",
    description:
      "Analyze sentiment of social media posts, reviews, or any text. Returns positive/negative/neutral scores.",
    endpoint: "https://api.example.com/sentiment",
    price: "8000000000000000",
    category: "ai",
    sellerAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    status: "APPROVED" as const,
    onChainId: 5,
    exampleRequest: { text: "Monad is the fastest L1 blockchain!" },
    exampleResponse: {
      sentiment: "positive",
      confidence: 0.92,
      scores: { positive: 0.92, neutral: 0.06, negative: 0.02 },
    },
  },
  {
    name: "NFT Metadata API",
    description:
      "Fetch and verify NFT metadata from any EVM chain. Supports ERC-721 and ERC-1155 standards.",
    endpoint: "https://api.example.com/nft-metadata",
    price: "3000000000000000",
    category: "data",
    sellerAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    status: "APPROVED" as const,
    onChainId: 6,
    exampleRequest: {
      chain: "monad",
      contract: "0x1234...abcd",
      tokenId: 1,
    },
    exampleResponse: {
      name: "Cool NFT #1",
      image: "ipfs://Qm...",
      attributes: [{ trait_type: "Rarity", value: "Legendary" }],
    },
  },
];

async function main() {
  console.log("Seeding database...");

  for (const api of seedApis) {
    await prisma.apiListing.upsert({
      where: { onChainId: api.onChainId },
      update: {},
      create: api,
    });
    console.log(`  Created: ${api.name}`);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
