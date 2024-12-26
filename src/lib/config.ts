const DEV = {
	API_BASE_URL: 'http://localhost:3000/api',
	SOCKET_URL: 'http://localhost:3000',
	SITE_URL: 'http://localhost:5173',
	BASE_PATH: ''
};

const PROD = {
	API_BASE_URL: 'https://rwsa-api.lipoic.org/api',
	SOCKET_URL: 'https://rwsa-api.lipoic.org',
	SITE_URL: 'https://rwhssa.github.io/rwhs-year-end-live-quiz-web',
	BASE_PATH: '/rwhs-year-end-live-quiz-web'
};

export const config = import.meta.env.DEV ? DEV : PROD;
