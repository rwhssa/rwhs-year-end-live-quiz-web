import { writable } from 'svelte/store';
import type { QuestionResult } from '$lib/types';

function createQuestionResultStore() {
	const { subscribe, set } = writable<QuestionResult | null>(null);

	return {
		subscribe,
		setResult: (result: QuestionResult) => set(result),
		reset: () => set(null)
	};
}

export const questionResultStore = createQuestionResultStore();
