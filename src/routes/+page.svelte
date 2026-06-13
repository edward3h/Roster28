<script lang="ts">
	import WarbandEditor from '$lib/components/WarbandEditor.svelte';
	import { loadWarband, saveWarband } from '$lib/model/storage';
	import type { Warband } from '$lib/model/types';

	function newWarband(): Warband {
		return { name: 'New warband', pointsBudget: 500, entries: [] };
	}

	let warband = $state(loadWarband() ?? newWarband());

	$effect(() => {
		saveWarband(warband);
	});
</script>

<svelte:head>
	<title>Planet 28 Roster Editor</title>
</svelte:head>

<main>
	<h1>Planet 28 Roster Editor</h1>
	<WarbandEditor bind:warband />
</main>

<style>
	main {
		max-width: 60rem;
		margin: 0 auto;
		padding: 1rem;
	}

	@media print {
		main {
			max-width: none;
			padding: 0;
		}

		h1 {
			display: none;
		}
	}
</style>
