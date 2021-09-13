<script lang="ts">
	export let name: string = "";
	let count = 0;
	setTimeout(() => {
		count++
	}, 1000);
</script>

<main>
	<h1>Hello {name}!</h1>
	<h2>{count}</h2>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style lang="scss">
	$header-color: #ff3e00;
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1 {
		color: $header-color;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>