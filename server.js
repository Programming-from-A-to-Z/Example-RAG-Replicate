import Replicate from 'replicate';
import express from 'express';
import bodyParser from 'body-parser';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Read and parse the embeddings from the file
const { embeddings } = JSON.parse(fs.readFileSync('data/embeddings.json', 'utf-8'));
console.log('Embeddings loaded.');

// Initialize Express application
const app = express();
app.use(bodyParser.json()); // Middleware for parsing JSON bodies
app.use(express.static('public')); // Serve static files from 'public' directory

// Initialize Replicate with API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
console.log('Replicate client initialized.');

// Model information for embedding generation
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

// Endpoint to find similar texts based on embeddings
app.post('/api/similar', async (request, response) => {
  let prompt = request.body.prompt;
  console.log('API /similar called. Searching for similarities to: ' + prompt);
  let n = request.body.n || 10;
  let similarities = await findSimilar(prompt);
  similarities = similarities.slice(0, n);
  response.json(similarities);
});

// Endpoint to query with context from similar texts
app.post('/api/query', async (request, response) => {
  let prompt = request.body.prompt;
  console.log('API /query called. Prompt: ' + prompt);
  let n = request.body.n || 10;
  let similarities = await findSimilar(prompt);
  similarities = similarities.slice(0, n);
  let answer = await askLlama(prompt, similarities);
  response.json({ prompt, answer, similarities });
});

// Function to generate a query with LLaMA model
async function askLlama(prompt, knowledge) {
  console.log('Asking LLaMA with knowledge length: ' + knowledge.length);
  const model = 'meta/meta-llama-3-8b-instruct';
  const input = {
    prompt: createPrompt(prompt, knowledge),
  };
  const output = await replicate.run(model, { input });
  return output;
}

// Function to create a prompt with given context and query
function createPrompt(prompt, knowledge) {
  console.log('Creating prompt for LLaMA.');
  const context = knowledge.map((item) => item.text).join('\n');
  // Assemble the prompt with context and instructions
  return `Context for the query is provided below. Use this information to answer the query.
---------------------
${context}
---------------------
Instructions:
- Use ONLY the provided context to answer the query.
- Do not use external knowledge or assumptions.
- Provide a clear and concise answer.
- Do not refer to the context or the speaker in your response.
Query: ${prompt}
Answer: `;
}

// Function to find similar texts based on cosine similarity
async function findSimilar(prompt) {
  console.log('Finding similar texts for: ' + prompt);
  const inputEmbedding = await getEmbedding(prompt);
  // Calculate similarity of each embedding with the input
  let similarities = embeddings.map(({ text, embedding }) => ({
    text,
    similarity: cosineSimilarity(inputEmbedding.embedding, embedding),
  }));
  // Sort similarities in descending order
  similarities = similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities;
}

// Start the server on the specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Cosine Similarity Functions
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}
