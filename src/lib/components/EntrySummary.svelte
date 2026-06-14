<script lang="ts">
	import { abilityNames, equipmentLabel, traitNames } from '$lib/model/labels';
	import { SKILL_KEYS, type CharacterProfile, type WarbandEntry } from '$lib/model/types';

	let { entry }: { entry: WarbandEntry } = $props();

	const profile: CharacterProfile = $derived(
		entry.type === 'character' ? entry.data : entry.data.profile
	);

	const skillsLine = $derived(
		`${SKILL_KEYS.map((key) => `${key}${profile.skills[key]}`).join(' ')} · HP${profile.hp}`
	);

	const traitNamesList = $derived(profile.traitIds.map((id) => traitNames.get(id) ?? id));
	const abilityNamesList = $derived(profile.abilityIds.map((id) => abilityNames.get(id) ?? id));
	const equipmentLabels = $derived(profile.equipment.map(equipmentLabel));

	const loadoutLines = $derived(
		entry.type === 'squad'
			? entry.data.loadouts
					.filter((loadout) => loadout.memberCount > 0)
					.map((loadout, index) => {
						const label = index === 0 ? 'Standard' : `Variant`;
						const weapons = loadout.weapons.map(equipmentLabel).join(', ') || 'none';
						return `${label} (${loadout.memberCount}): ${weapons}`;
					})
			: []
	);
</script>

<div class="entry-summary">
	{#if entry.type === 'squad'}
		<div class="row">Squad of {entry.data.memberCount}</div>
	{/if}
	<div class="row">{skillsLine}</div>
	{#if traitNamesList.length}
		<div class="row">Traits: {traitNamesList.join(', ')}</div>
	{/if}
	{#if abilityNamesList.length}
		<div class="row">Abilities: {abilityNamesList.join(', ')}</div>
	{/if}
	{#if equipmentLabels.length}
		<div class="row">Equipment: {equipmentLabels.join(', ')}</div>
	{/if}
	{#each loadoutLines as line}
		<div class="row">{line}</div>
	{/each}
</div>

<style>
	.entry-summary {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 0.8em;
		font-weight: normal;
		color: var(--muted-color, #555);
	}

	.row {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
