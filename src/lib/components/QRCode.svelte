<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let url: string;
	export let size = 256;

	let canvas: HTMLCanvasElement;

	onMount(async () => {
		await QRCode.toCanvas(canvas, url, {
			width: size,
			margin: 2,
			color: {
				dark: '#000',
				light: '#fff'
			}
		});
	});
</script>

<canvas bind:this={canvas} class="bg-white" width={size} height={size}></canvas>
