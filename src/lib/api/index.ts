const API_BASE_URL = 'http://localhost:3000/api';

const DEFAULT_FETCH_OPTIONS = {
	headers: {
		'Content-Type': 'application/json'
	}
};

export async function createStudentAccount(data: {
	class_name: string;
	nickname?: string;
}): Promise<string> {
	const response = await fetch(`${API_BASE_URL}/account`, {
		...DEFAULT_FETCH_OPTIONS,
		method: 'POST',
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error('登入失敗');
	}

	const { token } = await response.json();
	return token;
}

export interface QuestionOption {
	text: string;
	image_url?: string;
	is_correct: boolean;
}

export interface CreateQuizBody {
	text: string;
	image_url?: string;
	options: QuestionOption[];
}

export interface Question extends CreateQuizBody {
	id: number;
	options: QuestionOption[] & { id: number }[];
}

export async function getQuestions(): Promise<Question[]> {
	const response = await fetch(`${API_BASE_URL}/question`, DEFAULT_FETCH_OPTIONS);

	if (!response.ok) {
		throw new Error('取得題目失敗');
	}

	return response.json();
}

export async function createQuestion(data: CreateQuizBody): Promise<Question> {
	const response = await fetch(`${API_BASE_URL}/question`, {
		...DEFAULT_FETCH_OPTIONS,
		method: 'POST',
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error('建立題目失敗');
	}

	return response.json();
}

export async function getQuestionByRound(round: number): Promise<Question> {
	const response = await fetch(`${API_BASE_URL}/question/${round}`, DEFAULT_FETCH_OPTIONS);

	if (!response.ok) {
		throw new Error('取得題目失敗');
	}

	return response.json();
}

export interface SubmitAnswerBody {
	correct_option_ids: number[];
}

export async function submitAnswer(
	questionId: number,
	data: SubmitAnswerBody,
	token: string
): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/question/${questionId}/answer`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		method: 'POST',
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error('提交答案失敗');
	}
}
