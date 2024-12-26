<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { quizStore } from '$lib/stores/quizStore';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { initSocket, getSocket } from '$lib/socket';
	import { getQuestionByRound, submitAnswer } from '$lib/api';
	import type { Question } from '$lib/api';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import WaitingRoom from '$lib/components/WaitingRoom.svelte';

	const token = $derived($authStore);
	const quizStatus = $derived($quizStore);

	let currentRound = $state<number | null>(null);
	let currentQuestion = $state<Question | null>(null);
	let selectedAnswer = $state<number | null>(null);
	let isAnswerSubmitted = $state(false);
	let isLoadingQuestion = $state(false);
	let showLeaderboard = $state(false);
	let isFinalLeaderboard = $state(false);

	$effect(() => {
		if (quizStatus?.is_active) {
			if (quizStatus?.round && quizStatus.round !== currentRound) {
				currentRound = quizStatus.round;
				loadQuestion(quizStatus.round);
				showLeaderboard = false;
				isFinalLeaderboard = false;
			} else if (quizStatus?.round === null) {
				currentRound = null;
				currentQuestion = null;
				selectedAnswer = null;
				isAnswerSubmitted = false;
				showLeaderboard = false;
			}
		} else if (quizStatus?.is_active === false && quizStatus?.round !== null) {
			// 遊戲結束時顯示最終排行榜
			showLeaderboard = true;
			isFinalLeaderboard = true;
		}
		if (quizStatus?.remaining_time === 0) {
			showLeaderboard = true;
		}
	});

	async function loadQuestion(round: number) {
		if (isLoadingQuestion) return;
		isLoadingQuestion = true;
		selectedAnswer = null;
		isAnswerSubmitted = false;

		try {
			currentQuestion = await getQuestionByRound(round);
		} catch (error) {
			console.error('Failed to load question:', error);
			currentQuestion = null;
		} finally {
			isLoadingQuestion = false;
		}
	}

	async function handleAnswerSelect(index: number) {
		if (isAnswerSubmitted || !currentQuestion) return;
		selectedAnswer = index;
		isAnswerSubmitted = true;

		console.log('Submitting answer:', currentQuestion.options[index].id);

		try {
			await submitAnswer(
				currentQuestion.id,
				{
					correct_option_ids: [currentQuestion.options[index].id]
				},
				$authStore!
			);
		} catch (error) {
			console.error('Failed to submit answer:', error);
			// 可以在這裡加入錯誤處理的 UI 提示
		}
	}

	onMount(async () => {
		while (!authStore.isInitialized()) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		if (!$authStore) {
			goto('/');
			return;
		}

		initSocket({ token: $authStore, role: 'student' });
	});

	onDestroy(() => {
		const socket = getSocket();
		if (socket) {
			socket.disconnect();
		}
	});
</script>

{#if token}
	<div class="container mx-auto min-h-full p-4">
		<div class="w-full pb-32">
			{#if !quizStatus}
				<LoadingScreen />
			{:else if quizStatus.round === null}
				<WaitingRoom />
			{:else if isLoadingQuestion && !isFinalLeaderboard}
				<LoadingScreen />
			{:else if currentQuestion || isFinalLeaderboard}
				<div class="mx-auto w-full max-w-4xl space-y-6">
					{#if showLeaderboard}
						<Leaderboard {isFinalLeaderboard} />
					{:else if currentQuestion}
						<!-- 題目區域 -->
						<div class="card bg-base-200 p-6">
							<h2 class="text-center text-2xl font-bold">{currentQuestion.text}</h2>
							{#if currentQuestion.image_url}
								<img
									src={currentQuestion.image_url}
									alt="題目圖片"
									class="mx-auto mt-4 max-h-64 object-contain"
								/>
							{/if}
						</div>

						<!-- 選項區域 -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each currentQuestion.options as option, index}
								<button
									class="btn btn-lg h-auto min-h-24 w-full {selectedAnswer === index
										? 'btn-primary'
										: 'btn-outline'}"
									onclick={() => handleAnswerSelect(index)}
									disabled={isAnswerSubmitted}
								>
									<span class="text-lg">{option.text}</span>
								</button>
							{/each}
						</div>

						{#if isAnswerSubmitted}
							<div class="text-center">
								<p class="text-xl font-bold">答案已送出</p>
								<p>請等待下一題</p>
							</div>
						{/if}
					{/if}
				</div>
			{:else}
				<div class="text-center">
					<h2 class="text-2xl font-bold">準備開始第 {quizStatus.round} 題</h2>
					<p class="mt-2">載入題目失敗，請重新整理頁面</p>
				</div>
			{/if}
		</div>

		<!-- 只在非最終排行榜時顯示倒數計時 -->
		{#if quizStatus?.remaining_time !== undefined && !showLeaderboard && quizStatus?.round !== null && !isFinalLeaderboard}
			<div class="fixed bottom-0 left-0 right-0 bg-base-100 pb-4 pt-2 shadow-lg">
				<div class="container mx-auto flex justify-center">
					<div class="w-full max-w-xl">
						<div class="mb-2 text-center text-4xl font-bold">
							{quizStatus.remaining_time}
						</div>
						<div class="h-4 w-full overflow-hidden rounded-full bg-base-200">
							<div
								class="h-full bg-primary transition-all duration-1000"
								style="width: {(quizStatus.remaining_time / 10) * 100}%"
							></div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.btn {
		white-space: normal;
		height: auto;
		padding: 1rem;
	}
</style>
