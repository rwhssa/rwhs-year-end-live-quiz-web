const DEV = {
	API_BASE_URL: 'http://localhost:3000/api',
	SOCKET_URL: 'http://localhost:3000'
};

const PROD = {
	API_BASE_URL: 'http://rwsa-api.lipoic.org/api',
	SOCKET_URL: 'http://rwsa-api.lipoic.org'
};

export const config = import.meta.env.DEV ? DEV : PROD;
