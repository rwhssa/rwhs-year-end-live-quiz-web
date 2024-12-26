import { writable } from 'svelte/store';

function createAuthStore() {
	const { subscribe, set } = writable<string | null>(null);
	let initialized = false;

	return {
		subscribe,
		setToken: (token: string) => {
			localStorage.setItem('token', token);
			set(token);
		},
		init: () => {
			if (!initialized) {
				const token = localStorage.getItem('token');
				if (token) {
					set(token);
				}
				initialized = true;
			}
		},
		isInitialized: () => initialized
	};
}

export const authStore = createAuthStore();
