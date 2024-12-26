<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import { createStudentAccount } from '$lib/api';
	import { onMount } from 'svelte';
	import { config } from '$lib/config';

	let selectedClass = $state<string>();
	let selectedGrade = $state<string>();
	let nickname = $state<string>();
	let isLoading = $state(false);

	function generateClassOptions(grade: string): string[] {
		const numGrades: {
			[key: string]: number;
		} = {
			'1': 9,
			'2': 7,
			'3': 7,
			'4': 7,
			'5': 7,
			'6': 7
		};

		// Generate class options for the selected grade
		const classOptions = [];
		for (let classNum = 1; classNum <= numGrades[grade]; classNum++) {
			classOptions.push(`${grade}0${classNum}`);
		}
		return classOptions;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!selectedClass || !selectedGrade) {
			alert('請選擇年級和班級');
			return;
		}

		isLoading = true;

		try {
			const token = await createStudentAccount({
				class_name: selectedClass,
				nickname: nickname
			});

			authStore.setToken(token);
			goto(config.BASE_PATH + '/quiz');
		} catch (error) {
			alert('發生錯誤，請重試');
		} finally {
			isLoading = false;
		}
	}

	onMount(async () => {
		while (!authStore.isInitialized()) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		if ($authStore) {
			goto(config.BASE_PATH + '/quiz');
		}
	});
</script>

<div class="hero flex-1 bg-base-200">
	<div class="container hero-content mx-auto flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">你是誰？</h1>
		</div>
		<div class="card w-full shrink-0 bg-base-100 shadow-2xl">
			<form class="card-body" onsubmit={handleSubmit}>
				<input type="hidden" name="grade" value={selectedGrade} />
				<input type="hidden" name="class" value={selectedClass} />
				<input type="hidden" name="nickname" value={nickname} />
				<div class="form-control">
					<label class="label" for="grade-select">
						<span class="label-text">年級</span>
					</label>
					<select class="select select-bordered w-full" bind:value={selectedGrade} required>
						<option value="" disabled selected>請選擇年級</option>
						<option value="1">國一</option>
						<option value="2">國二</option>
						<option value="3">國三</option>
						<option value="4">高一</option>
						<option value="5">高二</option>
						<option value="6">高三</option>
					</select>
				</div>
				<div class="form-control">
					<label class="label" for="class-select">
						<span class="label-text">班級</span>
					</label>
					<select
						class="select select-bordered w-full"
						bind:value={selectedClass}
						required
						disabled={!selectedGrade}
					>
						<option value="" disabled selected>請選擇班級</option>
						{#if selectedGrade}
							{#each generateClassOptions(selectedGrade) as classOption}
								<option value={classOption}>{classOption}</option>
							{/each}
						{/if}
					</select>
				</div>
				<div class="form-control">
					<label class="label" for="nickname">
						<span class="label-text">暱稱（選填）</span>
					</label>
					<input
						type="text"
						placeholder="小明"
						class="input input-bordered"
						bind:value={nickname}
					/>
				</div>
				<div class="form-control mt-6">
					<button class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner"></span>
						{/if}
						開始！
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
