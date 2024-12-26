<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';

	let { children } = $props();

	onMount(() => {
		authStore.init();
	});
</script>

<div class="flex min-h-screen flex-col">
	<div class="navbar bg-neutral">
		<p class="btn btn-ghost text-xl">仁中歲末感恩活動 快問快答</p>
	</div>
	<main class="flex flex-1">
		{@render children()}
	</main>
	<footer class="footer footer-center bg-base-300 p-4 text-base-content">
		<aside>
			<p>Copyright © {new Date().getFullYear()} 仁武高中學生代表聯合會 保留一切權利。</p>
		</aside>
	</footer>
</div>
