# OpenAI Proxy

A simple proxy server to process batched requests to the OpenAI API server.

You can configure the number of seconds to wait between requests in the `src/index.ts` file.

Request format:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"model":"code-davinci-002", "prompt": "What is the meaning of life?", "max_tokens": 3000}
```

The request accepts the following parameters:

```ts
model: string;
prompt: string;
max_tokens?: number;
n?: number;
stop?: string[] | string;
temperature?: number;
top_p?: number;
frequency_penalty?: number;
presence_penalty?: number;
```

To get started, clone and run:

```bash
pnpm install
```

Create an `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=<your API key>
```

To start the server, run:

```bash
pnpm run start
```
