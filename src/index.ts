import express from 'express';
import bodyParser from 'body-parser';
import fetch, { FetchError } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiApiUrl = 'https://api.openai.com/v1/completions';

app.use(bodyParser.json());

interface CompletionRequest {
    model: string;
    prompt: string;
    max_tokens?: number;
    n?: number;
    stop?: string[] | string;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

let requestQueue: CompletionRequest[] = [];
let isRateLimited: boolean = false;
const requestDelaySeconds: number = 60;

const processQueue = async () => {
    if (isRateLimited || requestQueue.length === 0) {
        return;
    }

    const request = requestQueue.shift();

    if (!request) {
        return;
    }

    try {
        const response = await fetch(openaiApiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        console.log('Response: ', response);

        if (response.status === 429) {
            console.log('Rate limited, retrying after 60 seconds');
            throw new Error('Rate limited');
        }

        const data = await response.json();
        console.log('OpenAI API response:', data);

        processQueue();
    } catch (error: unknown) {
        if (error instanceof FetchError) {
            console.log('Fetch error:', error);
            if (error.message === 'Rate limited') {
                isRateLimited = true;
                console.log(
                    `Rate limited, retrying after ${requestDelaySeconds} seconds`
                );
                setTimeout(() => {
                    isRateLimited = false;
                    processQueue();
                }, requestDelaySeconds * 1000);
            } else {
                console.error('Error processing request:', error.message);
                processQueue();
            }
        }
    }
};

app.post('/completions', async (req, res) => {
    const completionRequest: CompletionRequest = req.body;
    console.log('OpenAI API key: ', openaiApiKey);

    requestQueue.push(completionRequest);

    processQueue();

    res.status(202).json({
        message:
            'Request added to the queue. It will be processed as soon as possible.',
    });
});

app.listen(port, () => {
    console.log(`OpenAI Proxy listening at http://localhost:${port}`);
});
