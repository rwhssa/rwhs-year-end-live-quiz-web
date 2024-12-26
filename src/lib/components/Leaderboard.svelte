<script lang="ts">
	import { questionResultStore } from '$lib/stores/questionResultStore';
	import { getQuestionByRound } from '$lib/api';
	import type { Question } from '$lib/api';
	import { flip } from 'svelte/animate';

	const props = $props<{ isFinalLeaderboard?: boolean }>();
	const isFinalLeaderboard = $derived(props.isFinalLeaderboard ?? false);
	const result = $derived($questionResultStore);
	let currentQuestion = $state<Question | null>(null);

	$effect(() => {
		if (result?.round) {
			loadQuestion(result.round);
		}
	});

	async function loadQuestion(round: number) {
		try {
			currentQuestion = await getQuestionByRound(round);
		} catch (error) {
			console.error('Failed to load question:', error);
		}
	}

	const positionColors = [
		'bg-[#FFD700]', // 金牌
		'bg-[#C0C0C0]', // 銀牌
		'bg-[#CD7F32]' // 銅牌
	];
</script>

<div class="card bg-base-200 p-6">
	<h2 class="mb-8 text-center text-3xl font-bold">
		{isFinalLeaderboard ? '最終排名' : '本題統計'}
	</h2>

	{#if result && (currentQuestion || isFinalLeaderboard)}
		{#if !isFinalLeaderboard && currentQuestion}
			<!-- 選項統計 -->
			<div class="mb-10">
				<h3 class="mb-4 text-xl font-semibold">作答情形</h3>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each Object.entries(result.option_percentages) as [option_id, percentage]}
						{@const option = currentQuestion.options.find((opt) => String(opt.id) === option_id)}
						{#if option}
							<div class="relative h-16 overflow-hidden rounded-lg bg-base-300">
								<div
									class="absolute inset-0 bg-primary/30 transition-all duration-500"
									style="width: {percentage * 100}%"
								></div>
								<div class="relative flex h-full items-center justify-between p-4">
									<div class="line-clamp-2 flex-1 text-base">
										{option.text}
									</div>
									<div class="ml-2 text-base font-bold">
										{(percentage * 100).toFixed(1)}%
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- 前三名展示 -->
		<div class="mt-{isFinalLeaderboard ? '0' : '6'}">
			<h3 class="mb-6 text-center text-2xl font-bold">
				{isFinalLeaderboard ? '' : '目前排名'}
			</h3>
			<div class="relative flex h-[200px] items-end justify-center gap-4">
				{#each result.top_3_classes as classInfo, index (classInfo.name)}
					<div
						class="flex flex-col items-center"
						style="height: {[80, 100, 60][index]}%"
						animate:flip={{ duration: 400 }}
					>
						<div class="flex flex-col items-center">
							<div class="mb-2 text-2xl font-bold">
								{classInfo.name}班
							</div>
							<div class="text-xl">{classInfo.score}分</div>
						</div>
						<div
							class="{positionColors[
								index
							]} w-32 flex-grow rounded-t-lg transition-all duration-500"
						>
							<div class="pt-4 text-center font-bold text-base-100">
								第{index + 1}名
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{/if}
</div>

<style>
	.flip-enter-active {
		transition: all 0.4s ease;
	}
	.flip-enter-from {
		transform: translateY(20px);
		opacity: 0;
	}
</style>
