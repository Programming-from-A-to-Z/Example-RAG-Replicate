# Retrieval Augmented Generation

## Overview

This is an example Node.js application that utilizes embeddings and the LLaMA model for text retrieval and response generation. It processes a text corpus, generates embeddings for "chunks", and uses these embeddings to performa a "similarity search" in response to queries. The system consists of a node.js server that handles API requests and a p5.js sketch for client interaction.

- `server.js`: Server file that handles API requests and integrates with the Replicate API.
- `save-embeddings.js`: Process a text file and generate embeddings.
- `test-embeddings.js`: Test the embeddings search functionality without all that client server stuff.
- `embeddings.json`: Precomputed embeddings generated from the text corpus.
- `public/`: p5.js sketch
- `.env`: API token

## References
- [Using open-source models for faster and cheaper text embeddings](https://replicate.com/blog/run-bge-embedding-models)
- [How to use retrieval augmented generation](https://replicate.com/blog/how-to-use-rag-with-chromadb-and-mistral-7b-instruct)

## How-To

1. Install Dependencies

```sh
npm install
```

2. Set up the `.env` file with your Replicate API token:

```env
REPLICATE_API_TOKEN=your_api_token_here
```

3. Generate the `embeddings.json` file by running `save-embeddings.js`. (You'll need to hard-code a text filename and adjust how the text is split up depending on the format of your data.)

```js
const raw = fs.readFileSync('text-corpus.txt', 'utf-8');
let chunks = raw.split(/\n+/);
```

```sh
node save-embeddings.js
```

4. Run the Server

```sh
node server.js
```

Open browser to: `http://localhost:3000` (or whatever port is specified.)
