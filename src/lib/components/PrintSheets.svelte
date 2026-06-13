<script lang="ts">
	import { characterCost, squadCost } from '$lib/model/points';
	import type { Warband } from '$lib/model/types';
	import CharacterSheet from './CharacterSheet.svelte';

	let { warband }: { warband: Warband } = $props();
</script>

<div class="print-sheets">
	{#each warband.entries as entry (entry.type === 'character' ? entry.data.id : entry.data.id)}
		{#if entry.type === 'character'}
			<CharacterSheet
				name={entry.data.name}
				profile={entry.data}
				cost={characterCost(entry.data)}
			/>
		{:else}
			<CharacterSheet
				name={entry.data.name}
				profile={entry.data.profile}
				cost={squadCost(entry.data)}
				subtitle={`Squad of ${entry.data.memberCount}, ${characterCost(entry.data.profile)}pts each`}
			/>
		{/if}
	{/each}
</div>

<style>
	.print-sheets {
		display: none;
	}

	@media print {
		.print-sheets {
			display: block;
		}
	}
</style>
