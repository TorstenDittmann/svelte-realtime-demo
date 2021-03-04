import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		endpoint: "139.59.177.219:9501/v1",
		endpointWs: "139.59.177.219/v1",
		project: "603fa93b82682",
		collection: "603faad486743"
	}
});

export default app;