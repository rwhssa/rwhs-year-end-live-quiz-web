<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { initSocket, getSocket, emitStatusChange } from '$lib/socket';
	import { quizStore } from '$lib/stores/quizStore';
	import { getQuestionByRound } from '$lib/api';
	import type { Question } from '$lib/api';

	const quizStatus = $derived($quizStore);
	let isLoading = $state(false);
	let connectionError = $state<string | null>(null);
	let currentRound = $state<number | null>(null);
	let currentQuestion = $state<Question | null>(null);
	let isLoadingQuestion = $state(false);

	$effect(() => {
		if (quizStatus?.round && quizStatus.round !== currentRound) {
			currentRound = quizStatus.round;
			loadQuestion(quizStatus.round);
		} else if (!quizStatus?.round) {
			currentRound = null;
			currentQuestion = null;
		}
	});

	async function loadQuestion(round: number) {
		if (isLoadingQuestion || round !== currentRound) return;
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

	onMount(() => {
		try {
			const socket = initSocket({ role: 'host' });
			socket.on('connect_error', (error) => {
				connectionError = '連線失敗：請確認伺服器是否正常運作';
			});
			socket.on('connect', () => {
				connectionError = null;
			});
		} catch (error) {
			connectionError = '初始化失敗：請重新整理頁面';
		}
	});

	onDestroy(() => {
		const socket = getSocket();
		if (socket) {
			socket.disconnect();
		}
	});

	async function handleStartQuiz() {
		isLoading = true;
		try {
			await emitStatusChange({
				is_active: true,
				round: 1
			});
		} catch (error) {
			console.error('Failed to start quiz:', error);
			connectionError = '操作失敗，請重試';
		} finally {
			isLoading = false;
		}
	}

	async function handleStopQuiz() {
		isLoading = true;
		try {
			await emitStatusChange({
				is_active: false,
				round: undefined
			});
		} catch (error) {
			console.error('Failed to stop quiz:', error);
			connectionError = '操作失敗，請重試';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">主持人控制台</h1>

	{#if connectionError}
		<div class="alert alert-error mb-4">
			<p>{connectionError}</p>
		</div>
	{:else if !quizStatus}
		<div class="flex items-center justify-center">
			<span class="loading loading-spinner loading-lg"></span>
			<p class="ml-2">載入中...</p>
		</div>
	{:else}
		<div class="mb-4 space-y-2">
			<p>遊戲狀態: {quizStatus.is_active ? '進行中' : '未開始'}</p>
			<p>目前題目序號: {quizStatus.round}</p>
			<p>目前學生人數: {quizStatus.num_students ?? 0} 人</p>

			{#if isLoadingQuestion}
				<div class="card bg-base-200 p-4">
					<p class="text-center">載入題目中...</p>
				</div>
			{:else if currentQuestion}
				<div class="card bg-base-200 p-4">
					<h3 class="text-xl font-bold">{currentQuestion.text}</h3>
					{#if currentQuestion.image_url}
						<img
							src={currentQuestion.image_url}
							alt="題目圖片"
							class="mx-auto mt-4 max-h-48 object-contain"
						/>
					{/if}
					<div class="mt-4 space-y-2">
						{#each currentQuestion.options as option, index}
							<div class="rounded bg-base-100 p-2">
								{index + 1}. {option.text}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="flex gap-4">
			<button
				class="btn btn-primary"
				onclick={handleStartQuiz}
				disabled={isLoading || quizStatus.is_active}
			>
				{#if isLoading}
					<span class="loading loading-spinner"></span>
				{/if}
				開始遊戲
			</button>
			<button
				class="btn btn-error"
				onclick={handleStopQuiz}
				disabled={isLoading || !quizStatus.is_active}
			>
				{#if isLoading}
					<span class="loading loading-spinner"></span>
				{/if}
				停止遊戲
			</button>
		</div>
	{/if}
</div>
