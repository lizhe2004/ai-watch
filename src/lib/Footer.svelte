<script>
	import GitHubButton from './GitHubButton.svelte';
</script>

<div
	class="max-w-4xl mx-auto w-full flex md:flex-row flex-col items-center md:justify-between py-8 mt-20 border-t border-white/20"
>
	<div class="text-white/70 flex items-center flex-none">
		Powered by <span class="mx-1 font-bold">阿里大模型</span>

	</div>
	<div class="text-white/70 flex items-center flex-none">
		 <span class="mx-1 font-bold">
		 <a href="https://support.qq.com/product/638926">提交意见反馈</a></span>
	</div>
	<div class="flex items-center mt-2 md:mt-0">

		<GitHubButton />
	</div>
</div>
