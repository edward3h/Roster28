<script lang="ts">
	import { characterCost, equipmentCost } from '$lib/model/points';
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
			{#each entry.data.loadouts as loadout (loadout.id)}
				<CharacterSheet
					name={entry.data.name}
					profile={{
						...entry.data.profile,
						equipment: [...entry.data.profile.equipment, ...loadout.weapons]
					}}
					cost={characterCost(entry.data.profile) + equipmentCost(loadout.weapons)}
					subtitle={`Squad of ${entry.data.memberCount} — ${loadout.memberCount} member${loadout.memberCount === 1 ? '' : 's'}`}
				/>
			{/each}
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
