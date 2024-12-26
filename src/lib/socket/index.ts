import { io, Socket } from 'socket.io-client';
import { quizStore } from '$lib/stores/quizStore';
import { questionResultStore } from '$lib/stores/questionResultStore';
import type { QuestionResult } from '$lib/types';

const SOCKET_URL = 'http://178.128.21.62:3000';

let socket: Socket;

type SocketAuth = {
	token?: string;
	role?: 'host' | 'student';
};

type HostInfo = {
	num_students: number;
};

export function initSocket(auth: SocketAuth) {
	const socketAuth: Record<string, string> = {};
	if (auth.role === 'host') {
		socketAuth.role = 'host';
	} else {
		socketAuth.token = auth.token || '';
		socketAuth.role = 'student';
	}

	socket = io(SOCKET_URL, {
		auth: socketAuth,
		reconnection: true,
		reconnectionAttempts: 5
	});

	socket.on('connect', () => {
		console.log('Connected to server');
	});

	socket.on('connect_error', (error) => {
		console.error('Connection error:', error);
	});

	socket.on('error', (error) => {
		console.error('Socket error:', error);
	});

	socket.on(
		'quiz-status',
		(status: { is_active?: boolean; round?: number; remaining_time?: number }) => {
			console.log('Received quiz status:', status);
			quizStore.setStatus(status);
		}
	);

	socket.on('question-result', (result: QuestionResult) => {
		console.log('Received question result:', result);
		questionResultStore.setResult(result);
	});

	socket.on('host-info', (info: HostInfo) => {
		console.log('Received host info:', info);
		quizStore.setHostInfo(info);
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from server');
	});

	return socket;
}

export function getSocket() {
	return socket;
}

export function emitStatusChange(status: {
	is_active?: boolean;
	round?: number | null;
}): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!socket) {
			reject(new Error('Socket not initialized'));
			return;
		}

		console.log('Emitting status change:', status);

		const timeout = setTimeout(() => {
			reject(new Error('Status change timeout'));
		}, 5000);

		socket.emit('status-change', status, (response: { success: boolean; error?: string }) => {
			clearTimeout(timeout);
			if (response.success) {
				resolve();
			} else {
				reject(new Error(response.error || 'Failed to change status'));
			}
		});
	});
}
