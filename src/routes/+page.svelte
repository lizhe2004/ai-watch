<script>
	import * as animateScroll from 'svelte-scrollto';
import {
	fade
} from 'svelte/transition';
import Form from '$lib/Form.svelte';
import Home from '$lib/Home.svelte';
import Footer from '$lib/Footer.svelte';
import Header from '$lib/Header.svelte';
import RecommendationCard from '$lib/RecommendationCard.svelte';
import { onMount } from 'svelte';
import LoadingCard from '$lib/LoadingCard.svelte';
import { createParser } from 'eventsource-parser';

let loading = false;
let error = '';
let endStream = false;
let makeRecommendation = false;

/**
 * @type {string}
 */
let searchResponse = '';
/**
 * @type {Array<string | {title: string, description: string}>}
 */
let recommendations = [];

/**
 * @param {string} target
 */

$: {
	if (searchResponse) {
		let lastLength = recommendations.length;
		console.log(searchResponse);
		let x = searchResponse?.split('\n');
		console.log("x.length:" + x.length);
		recommendations = x.map((d, i) => {
			console.log("iter：d:" + d + ",i:" + i);
			if ((x.length - 1 > i || endStream) && d !== '') {
				// @ts-ignore
				if( d.match(/\d\.\s*(.*?)[:|：]\s*(.*)/)==null){
					if (lastLength<2)
						return d;
					else return "";
				}
				const [, title, description] = d.match(/\d\.\s*(.*?)[:|：]\s*(.*)/)
				console.log("title:"+title+",description:"+description);
				return { title, description };
			} else {
				return d;
			}
		});
		if (recommendations.length > lastLength) {
			animateScroll.scrollToBottom({ duration: 1500 });
		}
	}
}

/**
 * @type {string}
 */
let cinemaType = '电影';
/**
 * @type {Array<string>}
 */
let selectedCategories = [];
let specificDescriptors = '';

async function search() {
	if (loading) return;
	recommendations = [];
	searchResponse = '';
	endStream = false;
	loading = true;

	let fullSearchCriteria = ` 现在你是一名资深的影视剧评论家，你需要推荐5部符合下列条件的适合中国人观看的 ${cinemaType!="不限"?`${cinemaType}`:`影视剧`}, 请不要编造影视剧剧情以及演员信息，要实事求是。根据豆瓣网、IMDb、Mtime时光网、猫眼电影、知乎网、百度百科等网站进行推荐，要求信息真实可靠，不要胡编乱造。\n ${
			selectedCategories.length>0 ? `它们的类型要属于：[ ${selectedCategories}]\n` : ''
		}. ${
			specificDescriptors
				? `要与后面括号中的内容相关或符合其要求：( ${specificDescriptors}).\n`
				: ''
		} ${
			selectedCategories || specificDescriptors
				? ``
				: ''
		} 请采用数字标记的列表清单的形式返回，格式为{序号. 标题(发布年份):说明}，不要添加额外说明解释。每条记录之间用空行分隔。\n输出示例\n 1.摩登时代(1936):卓别林自导自演的一部经典默片，通过独特的幽默手法揭示了工业化社会中普通人的辛酸与无奈。\n\n2.城市之光(1931):卓别林执导并主演的喜剧电影，讲述了流浪汉与盲女之间的感人故事，体现了人性的善良与美好。\n\n3.大独裁者(1940):卓别林导演并主演的一部具有深刻反战与反法西斯主题的电影，他在片中饰演了一位与希特勒形象相仿的大独裁者。\n\n4.淘金记 The Gold Rush (1925):这是卓别林的代表作之一，影片以美国淘金热为背景，展现了小人物在逆境中的坚韧与乐观。\n\n5.马戏团(1928): 卓别林晚年自导自演的一部作品，通过讲述一个流浪艺人的人生起伏，展示了他对生活的热爱与追求。\n\n`;
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const response = await fetch('/api/getRecommendation', {
		method: 'POST',
		body: JSON.stringify({ searched: fullSearchCriteria }),
		headers: {
			'content-type': 'application/json'
		}
	});

	// if (response.ok) {
	// 	try {
	// 		const data = response.body;
	// 		if (!data) {
	// 			return;
	// 		}

	// 		const reader = data.getReader();
	// 		const decoder = new TextDecoder('utf-8');

	// 		while (true) {
	// 			const { value, done } = await reader.read();
	// 			console.log
	// 			const chunkValue = decoder.decode(value);
	// 			console.log("reading----"+chunkValue)
	// 			searchResponse += chunkValue;

	// 			if (done) {
	// 				endStream = true;
	// 				break;
	// 			}
	// 		}
	// 	} catch (err) {
	// 		error = 'Looks like OpenAI timed out :(';
	// 		console.log(err);
	// 	}
	// } else {
	// 	error = await response.text();
	// }
	loading = false;
	const reader = response.body.getReader();

	function onParse(event) {
		if (event.type === 'event') {
			var data = event.data;
			// https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
			if (data === '[DONE]') {
				endStream = true
				console.log("输出结束了！！！")
				return;

			}
			data = data.replace(/\\n/g, "\n");
			console.log("reading" + data)
			searchResponse += data;
		}
	}

	// stream response (SSE) from OpenAI may be fragmented into multiple chunks
	// this ensures we properly read chunks and invoke an event for each SSE event stream
	const parser = createParser(onParse);

	// https://web.dev/streams/#asynchronous-iteration


	function readStream() {
		return reader.read().then(({ done, value }) => {
			if (done) {
				return;
			}
			parser.feed(decoder.decode(value));
			return readStream();
		});
	}
	readStream().catch(error => {
		console.error('Error reading stream:', error);
	});
}

function clearForm() {
	recommendations = [];
	searchResponse = '';
	endStream = false;
	cinemaType = '电影';
	selectedCategories = [];
	specificDescriptors = '';
} 
</script>

<div>
	<div class="h-screen w-full bg-cover fixed" style="background-image: url(/background.png)">
	<div
class={`${
				makeRecommendation ? 'backdrop-blur-md' : ''
			}  flex flex-col items-center justify-center min-h-screen w-full h-full bg-gradient-to-br from-slate-900/80 to-black/90`}
/>
	</div>

<div class="absolute inset-0 px-6 flex flex-col h-screen overflor-auto">
	<Header
on:click={() => {
		makeRecommendation = false;
	}}
/>

{#if !makeRecommendation}
			<div
	in:fade
class="flex-grow max-w-4xl mx-auto w-full md:pt-20  flex flex-col items-center justify-center"
			>
	<Home
on:click={() => {
		makeRecommendation = true;
	}}
/>
			</div>
		{:else}
			<div in:fade class="w-full max-w-4xl mx-auto">
	<div class="w-full mb-8">
	<Form
bind:cinemaType
bind:selectedCategories
bind:loading
bind:specificDescriptors
on:click={search}
/>
					{#if recommendations.length > 0 && endStream}
						<button
on:click={clearForm}
class="bg-white/20 hover:bg-white/30 mt-4 w-full h-10 text-white font-bold p-3 rounded-full flex items-center justify-center"
						>
	清除搜索
						</button>
					{/if}
				</div>
				<div class="md:pb-20 max-w-4xl mx-auto w-full">
					{#if loading && !searchResponse && !recommendations}
						<div class="fontsemibold text-lg text-center mt-8 mb-4">
			Please be patient as I think. Good things are coming 😎.
						</div>
					{/if}
					{#if error}
						<div class="fontsemibold text-lg text-center mt-8 text-red-500">
					Woops! {error}
						</div>
					{/if}
					{#if recommendations}
						{#each recommendations as recommendation, i (i)}
							<div>
								{#if recommendation !== ''}
									<div class="mb-8">
										{#if typeof recommendation !== 'string' && recommendation.title}
											<RecommendationCard {recommendation} />
										{:else}
											<div in:fade>
												<LoadingCard incomingStream={recommendation} />
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
		<Footer />
	</div>
</div>
