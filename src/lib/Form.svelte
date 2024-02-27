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
		"古装","动作","武侠","科幻",	"喜剧",
"战争","谍战","军旅",
"犯罪","警匪","枪战",
"悬疑","罪案","恐怖",
"惊悚",

"言情","爱情","青春",
"都市",
"偶像",
"历史","剧情","年代戏",
"穿越",

"动画",
"儿童",




"奇幻","农村",


"冒险",
"家庭",
 
"灾难",
"传记",
"纪录片", 
	];


const tvCategories=	["古装",
"战争",
"谍战",
"言情",
"武侠",
"罪案",
"悬疑",
"网剧",
"家庭",
"军旅",
"都市",
"偶像",
"喜剧",
"青春",
"科幻",
"农村",
"穿越",
"奇幻",
"历史",
"年代"
	 ];
	 const areas =["内地",
"中国香港",
"中国台湾",
"韩国",
"泰国",
"美国",
"日本",
"英国",
"欧洲",
"印度"
]
	
const filmCategories =["喜剧",
"爱情",
"动作",
"动画",
"恐怖",
"惊悚",
"枪战",
"科幻",
"战争",
"犯罪",
"悬疑",
"奇幻",
"剧情",
"青春",
"冒险",
"家庭",
"警匪",
"历史",
"武侠",
"儿童",
"灾难"];

const filemStyle=[
"搞笑",
"残酷",
"励志",
"温暖",
"怀旧",
"伤感",
"文艺",
"老电影",
"清新",
"燃",
"烧脑",
"催泪",
"惊险",
"华丽",
"热血"]
const filemEmotions=[
"希望",
"欢乐",
"震撼",
"喜悦",
"恐惧",
"忧郁",
"绝望",
"勇气",
"可爱",
"感动",
"暧昧",
"幸福"]

const filmSubjects=[
"友谊",
"成长",
"社会问题",
"亲情",
"都市",
"婚姻",
"道德",
"警察",
"乡村",
"古装",
"小人物",
"逃亡",
"军事",
"纯爱",
"复仇"]
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
