<script>
	import LoadingIndicator from './Loading.svelte';

	/**
	 * @type string
	 */
	export let cinemaType;
	/**
	 * @type Array<string>
	 */
	export let selectedCategories;
	/**
	 * @type string
	 */
	export let specificDescriptors;
	/**
	 * @type Boolean
	 */
	export let loading;

	const categoryTypes = [
	"动作片",
"冒险片",
"动画片",
"传记片",
"喜剧片",
"犯罪片",
"纪录片",
"剧情片",
"家庭片",
"奇幻片",
"黑色电影",
"历史片",
"恐怖片",
"音乐剧",
"悬疑片",
"爱情片",
"科幻片",
"运动片",
"惊悚片",
"战争片",
"西部片",
"艺术类型",
"黑色喜剧",
"娇媚类型",
"狂热经典",
"黑色幽默",
"史诗片",
"情色类型",
"实验类型",
"童话片",
"电影中的电影",
"未来主义类型",
"黑帮片",
"抢劫片",
"历史剧",
"假日片",
"独立类型",
"青少年片",
"悲剧",
"怪物类型",
"政治类型",
"心理剧",
"公路类型",
"讽刺片",
"科幻片",
"闹剧",
"社会议题",
"超级英雄",
"超现实",
"青少年",
"吸血鬼",
"僵尸"
	];

	let cinemaTypes = [
		{ value: '电视剧', title: '电视剧' },
		{ value: '电影', title: '电影' },
		{ value: '影视剧', title: '不限' }
	];
</script>

<div class="pt-6 md:pt-10 text-slate-200">
	<div>
		<div class="mb-8">
			<div class="mb-4 font-semibold text-lg">
			您要查询的影视剧类型是？
			</div>
			<div class="flex items-center">
				{#each cinemaTypes as type (type.value)}
					<button
						on:click={() => {
							cinemaType = type.value;
						}}
						class={`${
							cinemaType === type.value ? 'bg-pink-600/40' : ''
						} text-slate-200 font-bold mr-2 text-sm mt-2 py-2 px-4 rounded-full border border-pink-600`}
					>
						{type.title}
					</button>
				{/each}
			</div>
		</div>
		<div>
			<div class="mb-4 font-semibold text-lg">
				选择想要观看的影视剧的分类
			</div>
			<div class="flex items-center flex-wrap">
				{#each categoryTypes as category}
					<label
						class={`${
							selectedCategories.includes(category) ? 'bg-pink-600/40' : ''
						} text-slate-200 font-bold mr-2 mt-2 text-sm py-2 px-4 rounded-full border border-pink-600`}
					>
						<input
							class="hidden"
							type="checkbox"
							bind:group={selectedCategories}
							name="categories"
							value={category}
						/>
						{category}
					</label>
				{/each}
			</div>
		</div>
		<div class="mt-8">
			<div class="mb-4 font-semibold text-lg">
				在此处输入其他任意影视剧信息，可以随意发挥。
			</div>
			<textarea
				bind:value={specificDescriptors}
				class="bg-white/40 border border-white/0 p-2 rounded-md placeholder:text-slate-800 text-slate-900 w-full h-20 font-medium"
				placeholder="例如：爱奇艺上映的有爸爸和儿子角色的电影"
			/>
			<button
				on:click
				class={`${
					loading
						? 'bg-pink-400/50'
						: 'bg-pink-600 hover:bg-gradient-to-r from-pink-700 via-pink-600 to-pink-700 '
				} mt-4 w-full h-10 text-white font-bold p-3 rounded-full flex items-center justify-center`}
			>
				{#if loading}
					<LoadingIndicator />
				{:else}
					<p>生成我的片单</p>
				{/if}
			</button>
		</div>
	</div>
</div>
