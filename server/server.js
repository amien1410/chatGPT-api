import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("OpenAI API key not found. Please provide it in the environment variables.");
    process.exit(1);
}

const configuration = new Configuration({
    apiKey,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

// GET endpoint to check server status
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Chat GPT'
    });
});

// POST endpoint to generate AI response based on user prompt
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        // Validate prompt length or content if necessary

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        });
    } catch (error) {
        console.error("Error occurred:", error.message); // Logging only the error message
        res.status(500).send({ error: "An internal server error occurred." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
