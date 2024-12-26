<script lang="ts">
	import { authStore } from '$lib/stores/authStore';
	import { quizStore } from '$lib/stores/quizStore';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { initSocket, getSocket } from '$lib/socket';
	import { getQuestionByRound } from '$lib/api';
	import type { Question } from '$lib/api';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import QRCode from '$lib/components/QRCode.svelte';
	import { config } from '$lib/config';

	const token = $derived($authStore);
	const quizStatus = $derived($quizStore);

	let currentRound = $state<number | null>(null);
	let currentQuestion = $state<Question | null>(null);
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
				showLeaderboard = false;
			}
		} else if (quizStatus?.is_active === false && quizStatus?.round !== null) {
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

		try {
			currentQuestion = await getQuestionByRound(round);
		} catch (error) {
			console.error('Failed to load question:', error);
			currentQuestion = null;
		} finally {
			isLoadingQuestion = false;
		}
	}

	onMount(async () => {
		while (!authStore.isInitialized()) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		if (!$authStore) {
			goto(config.BASE_PATH + '/');
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
	<div class="min-h-screen bg-base-100">
		<!-- QR Code 固定在右上角 -->
		<div
			class="fixed right-12 top-12 z-50 flex flex-col items-center gap-6 bg-base-100/80 p-6 backdrop-blur"
		>
			<QRCode url={config.SITE_URL} size={300} />
			<p class="text-2xl">{config.SITE_URL}</p>
		</div>

		{#if !quizStatus}
			<LoadingScreen />
		{:else if quizStatus.round === null}
			<div class="flex min-h-screen flex-col items-center justify-center p-8">
				<h1 class="mb-8 text-6xl font-bold">等待開始測驗</h1>
			</div>
		{:else if isLoadingQuestion && !isFinalLeaderboard}
			<LoadingScreen />
		{:else if currentQuestion || isFinalLeaderboard}
			<div class="mx-auto min-h-screen w-full max-w-[1920px] p-8">
				{#if showLeaderboard}
					<Leaderboard {isFinalLeaderboard} />
				{:else if currentQuestion}
					<div class="flex min-h-[calc(100vh-200px)] flex-col gap-8">
						<!-- 題目區域 -->
						<div class="card flex-1 bg-base-200 p-8">
							<div class="flex h-full flex-col items-center justify-center gap-8">
								<h2 class="text-center text-4xl font-bold">
									第 {currentRound} 題
								</h2>
								<p class="text-center text-5xl">{currentQuestion.text}</p>
								{#if currentQuestion.image_url}
									<img
										src={currentQuestion.image_url}
										alt="題目圖片"
										class="mx-auto max-h-[40vh] object-contain"
									/>
								{/if}
							</div>
						</div>

						<!-- 選項區域 -->
						<div class="grid h-[30vh] grid-cols-2 gap-8">
							{#each currentQuestion.options as option, index}
								<div
									class="card flex items-center justify-center p-8"
									class:bg-red-500={index === 0}
									class:bg-blue-500={index === 1}
									class:bg-yellow-500={index === 2}
									class:bg-green-500={index === 3}
								>
									<p class="text-center text-4xl text-white">
										{option.text}
									</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- 倒數計時 -->
		{#if quizStatus?.remaining_time !== undefined && !showLeaderboard && quizStatus?.round !== null && !isFinalLeaderboard}
			<div class="fixed bottom-0 left-0 right-0 bg-base-100 pb-6 pt-3 shadow-lg">
				<div class="container mx-auto flex justify-center">
					<div class="w-full max-w-xl">
						<div class="mb-2 text-center text-6xl font-bold">
							{quizStatus.remaining_time}
						</div>
						<div class="h-6 w-full overflow-hidden rounded-full bg-base-200">
							<div
								class="h-full bg-primary transition-all duration-1000"
								style="width: {(quizStatus.remaining_time / 10) * 100}%"
							/>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
