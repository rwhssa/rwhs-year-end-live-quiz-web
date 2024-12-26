<script lang="ts">
	import { onMount } from 'svelte';
	import { getQuestions, createQuestion } from '$lib/api';
	import type { Question, CreateQuizBody } from '$lib/api';

	let questions = $state<Question[]>([]);
	let isLoadingQuestions = $state(false);
	let newQuestion = $state<CreateQuizBody>({
		text: '',
		image_url: '',
		options: [
			{ text: '', is_correct: false },
			{ text: '', is_correct: false },
			{ text: '', is_correct: false },
			{ text: '', is_correct: false }
		]
	});

	async function loadQuestions() {
		isLoadingQuestions = true;
		try {
			questions = await getQuestions();
		} catch (error) {
			console.error('Failed to load questions:', error);
			alert('載入題目失敗');
		} finally {
			isLoadingQuestions = false;
		}
	}

	async function handleSubmitQuestion(event: Event) {
		event.preventDefault();
		if (!newQuestion.text || newQuestion.options.some((opt) => !opt.text)) {
			alert('請填寫完整的題目內容和選項');
			return;
		}

		if (!newQuestion.options.some((opt) => opt.is_correct)) {
			alert('請至少選擇一個正確答案');
			return;
		}

		try {
			const created = await createQuestion(newQuestion);
			questions = [...questions, created];
			newQuestion = {
				text: '',
				image_url: '',
				options: [
					{ text: '', is_correct: false },
					{ text: '', is_correct: false },
					{ text: '', is_correct: false },
					{ text: '', is_correct: false }
				]
			};
		} catch (error) {
			console.error('Failed to create question:', error);
			alert('建立題目失敗');
		}
	}

	onMount(loadQuestions);

	function openModal() {
		const modal = document.getElementById('new_question_modal') as HTMLDialogElement;
		modal.showModal();
	}

	function closeModal() {
		const modal = document.getElementById('new_question_modal') as HTMLDialogElement;
		modal.close();
	}
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">題目管理</h1>

	<!-- 題目列表 -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-bold">題目列表</h2>
		{#if isLoadingQuestions}
			<span class="loading loading-spinner"></span>
		{:else}
			<div class="space-y-4">
				{#each questions as question (question.id)}
					<div class="card bg-base-200">
						<div class="card-body">
							<h3 class="card-title">{question.text}</h3>
							{#if question.image_url}
								<img src={question.image_url} alt="題目圖片" class="max-w-xs" />
							{/if}
							<ul class="list-inside list-disc">
								{#each question.options as option}
									<li class={option.is_correct ? 'text-success' : ''}>
										{option.text}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- 新增題目按鈕 -->
	<div>
		<h2 class="mb-4 text-xl font-bold">新增題目</h2>
		<button class="btn btn-primary" onclick={openModal}>新增題目</button>
	</div>
</div>

<!-- 新增題目 Modal -->
<dialog id="new_question_modal" class="modal modal-bottom sm:modal-middle">
	<div class="modal-box">
		<h3 class="text-lg font-bold">新增題目</h3>
		<form onsubmit={handleSubmitQuestion} class="space-y-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">題目內容</span>
				</label>
				<input type="text" bind:value={newQuestion.text} class="input input-bordered" required />
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">圖片網址（選填）</span>
				</label>
				<input type="url" bind:value={newQuestion.image_url} class="input input-bordered" />
			</div>

			<div class="space-y-2">
				<label class="label">
					<span class="label-text">選項</span>
				</label>
				{#each newQuestion.options as option, i}
					<div class="flex items-center gap-2">
						<input
							type="text"
							bind:value={option.text}
							class="input input-bordered flex-1"
							placeholder={`選項 ${i + 1}`}
							required
						/>
						<label class="label cursor-pointer">
							<input type="checkbox" bind:checked={option.is_correct} class="checkbox" />
							<span class="label-text ml-2">正確答案</span>
						</label>
					</div>
				{/each}
			</div>

			<div class="modal-action">
				<button type="submit" class="btn btn-primary">新增題目</button>
				<button type="button" class="btn" onclick={closeModal}>取消</button>
			</div>
		</form>
	</div>
</dialog>
