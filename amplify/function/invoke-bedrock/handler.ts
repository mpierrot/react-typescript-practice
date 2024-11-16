import { Context, Handler } from 'aws-lambda';
import { Writable } from 'stream';
import {
    BedrockRuntimeClient,
    InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

type eventType = {
    prompt: string
}

const modelId = "anthropic.claude-3-haiku-20240307-v1:0"

export const handler: Handler = awslambda.streamifyResponse(
    async (event: eventType, responseStream: Writable, _context: Context) => {

        const client = new BedrockRuntimeClient({ region: "us-east-1" });

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: event.prompt }],
                },
            ],
        };

        const command = new InvokeModelWithResponseStreamCommand({
            contentType: "application/json",
            body: JSON.stringify(payload),
            modelId,
        });

        const apiResponse = await client.send(command);

        if (apiResponse.body) {
            for await (const item of apiResponse.body) {
                if (item.chunk) {
                    const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
                    const chunk_type = chunk.type;

                    if (chunk_type === "content_block_delta") {
                        const text = chunk.delta.text;
                        responseStream.write(text);
                    }
                } else if (item.internalServerException) {
                    throw item.internalServerException
                } else if (item.modelStreamErrorException) {
                    throw item.modelStreamErrorException
                } else if (item.throttlingException) {
                    throw item.throttlingException
                } else if (item.validationException) {
                    throw item.validationException
                }
            }
        }

        responseStream.end()
    }
)