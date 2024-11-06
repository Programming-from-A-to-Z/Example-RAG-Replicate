import Replicate from 'replicate';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Initialize Replicate with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Model information for embedding
const version = 'b6b7585c9640cd7a9572c6e129c9549d79c9c31f0d3fdce7baac7c67ca38f305';
const model = 'replicate/all-mpnet-base-v25';

// Function to get embedding for a given text
async function getEmbedding(text) {
  console.log(`Generating embedding for test query: "${text}"`);
  const input = {
    text_batch: JSON.stringify([text]),
  };
  const output = await replicate.run(`${model}:${version}`, { input });
  return output[0];
}

// Load pre-computed embeddings from file
const { embeddings } = JSON.parse(fs.readFileSync('data/embeddings.json', 'utf-8'));

// Test function to demonstrate embeddings search
async function test() {
  const prompt = "How do I set a shape's color?";
  console.log(`Test query: "${prompt}"`);
  const inputEmbedding = await getEmbedding(prompt);

  // Calculate similarity of the test query with each stored embedding
  let similarities = embeddings.map(({ text, embedding }) => ({
    text,
    similarity: cosineSimilarity(inputEmbedding.embedding, embedding),
  }));
  // Sort the results by similarity in descending order
  similarities = similarities.sort((a, b) => b.similarity - a.similarity);

  // Display the top 10 results
  console.log('Top 10 Results:');
  similarities = similarities.slice(0, 10);
  similarities.forEach((item, index) => {
    console.log(`${index + 1}: ${item.text} (Similarity: ${item.similarity.toFixed(3)})`);
  });
}

// Functions to calculate cosine similarity
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}
function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}
function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

// Call the test function
test();
