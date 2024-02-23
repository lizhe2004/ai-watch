import { createParser } from 'eventsource-parser';
import { OPENAI_API_KEY } from '$env/static/private';

const key = OPENAI_API_KEY;

interface OpenAIStreamPayload {
	model: string;
	messages: Array<object>;
	temperature: number;
	top_p: number;
	frequency_penalty: number;
	presence_penalty: number;
	max_tokens: number;
	stream: boolean;
	n: number;
}

async function OpenAIStream(payload: OpenAIStreamPayload) {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	let counter = 0;

	// const res = await fetch('https://api.openai.com/v1/completions', {
		const res = await fetch("https://one-api.lizhe.io/v1/chat/completions", {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key}`
		},
		method: 'POST',
		body: JSON.stringify(payload)
	});

	const stream = new ReadableStream({
		async start(controller) {
			function onParse(event: any) {
				if (event.type === 'event') {
					const data = event.data;
					// https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
					if (data === '[DONE]') {
						controller.close();
						return;
					}
					try {
						const json = JSON.parse(data);
						console.log("接受到的内容是 "+data)
						// const text = json.choices[0].text;
						const text = json.choices[0].delta.content;
						
						if(text){
							console.log("原样输出 "+ text)
							console.log(counter)
							console.log(text.match(/\n/))
							console.log(counter < 2 && (text.match(/\n/) || []).length)
							if (counter < 2 && (text.match(/\n/) || []).length) {
								// this is a prefix character (i.e., "\n\n"), do nothing
								console.log("counter < 2 && (text.match(/\n/) || []).length"+ text)
								return;
							}
							event.data=data;
							const queue = encoder.encode(text);
							controller.enqueue(queue);
							console.log("计数加一"+ text)
							counter++;
						}
						else{
							console.log("text为false？text是" + text)
							console.log("text为false？data是 " + data)
						}
					} catch (e) {
						controller.error(e);
						console.error(e)
					}
				}
			}

			// stream response (SSE) from OpenAI may be fragmented into multiple chunks
			// this ensures we properly read chunks and invoke an event for each SSE event stream
			const parser = createParser(onParse);
		 
			// https://web.dev/streams/#asynchronous-iteration
			for await (const chunk of res.body as any) {
				parser.feed(decoder.decode(chunk));
			}
		}
	});
	return stream;
}

export async function POST({ request }: { request: any }) {
	const { searched } = await request.json();
	console.log(searched);
	const payload = {
		model: 'gpt-3.5-turbo',
		messages: [ {"role": "user", "content": searched}],
		temperature: 0.7,
		max_tokens: 2048,
		top_p: 1.0,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	};
	console.log(payload);
	const stream = await OpenAIStream(payload);
	return new Response(stream);
}
