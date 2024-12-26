import { writable } from 'svelte/store';

export type QuizStatus = {
	is_active?: boolean;
	round?: number;
	num_students?: number;
	remaining_time?: number;
};

function createQuizStore() {
	const { subscribe, set, update } = writable<QuizStatus | null>(null);

	return {
		subscribe,
		setStatus: (status: Partial<QuizStatus>) => {
			update((currentStatus) => {
				if (!currentStatus) {
					return status as QuizStatus;
				}
				return {
					...currentStatus,
					...status
				};
			});
		},
		setHostInfo: (info: { num_students: number }) => {
			update((currentStatus) => {
				if (!currentStatus) {
					return { num_students: info.num_students } as QuizStatus;
				}
				return {
					...currentStatus,
					num_students: info.num_students
				};
			});
		},
		reset: () => {
			set(null);
		}
	};
}

export const quizStore = createQuizStore();
