<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<footer>
	<a href="https://github.com/edward3h/Roster28/issues" target="_blank" rel="noopener noreferrer">Report a bug</a>
</footer>

<style>
	footer {
		max-width: 60rem;
		margin: 0 auto;
		padding: 1rem;
		text-align: center;
		font-size: 0.85rem;
		color: #666;
	}

	@media print {
		footer {
			display: none;
		}
	}
</style>
