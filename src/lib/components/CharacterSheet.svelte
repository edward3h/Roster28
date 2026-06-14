<script lang="ts">
	import { equipmentItemCost } from '$lib/model/points';
	import { abilityNames, equipmentLabel, traitNames } from '$lib/model/labels';
	import type { CharacterProfile } from '$lib/model/types';

	let {
		name,
		profile,
		cost,
		subtitle = ''
	}: { name: string; profile: CharacterProfile; cost: number; subtitle?: string } = $props();
</script>

<div class="sheet">
	<div class="title-row">
		<div class="name">
			<strong>Name:</strong> {name}
			{#if subtitle}<span class="subtitle">({subtitle})</span>{/if}
		</div>
		<div class="points"><strong>Points cost:</strong> {cost}</div>
	</div>

	<table class="skills">
		<thead>
			<tr>
				<th>Agility</th>
				<th>Shooting</th>
				<th>Fighting</th>
				<th>Psyche</th>
				<th>Awareness</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>{profile.skills.A}</td>
				<td>{profile.skills.S}</td>
				<td>{profile.skills.F}</td>
				<td>{profile.skills.P}</td>
				<td>{profile.skills.AW}</td>
			</tr>
		</tbody>
	</table>

	<table class="vitals">
		<thead>
			<tr>
				<th>Speed</th>
				<th>Hit-points</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>10cm</td>
				<td>{profile.hp}</td>
			</tr>
		</tbody>
	</table>

	<div class="box">
		<strong>Traits:</strong>
		{#if profile.traitIds.length}
			{profile.traitIds.map((id) => traitNames.get(id) ?? id).join(', ')}
		{/if}
	</div>

	<div class="box">
		<strong>Abilities:</strong>
		{#if profile.abilityIds.length}
			{profile.abilityIds.map((id) => abilityNames.get(id) ?? id).join(', ')}
		{/if}
	</div>

	<div class="bottom-row">
		<div class="box equipment">
			<strong>Equipment:</strong>
			<ul>
				{#each profile.equipment as item (item.id)}
					<li>{equipmentLabel(item)} ({equipmentItemCost(item)})</li>
				{/each}
			</ul>
		</div>
		<div class="box-column">
			<div class="box"><strong>Injuries:</strong></div>
			<div class="box"><strong>Campaign points:</strong></div>
		</div>
	</div>
</div>

<style>
	.sheet {
		border: 2px solid #000;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0;
		break-inside: avoid;
		page-break-inside: avoid;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #000;
		padding: 0.25rem;
		font-size: 1.1em;
	}

	.subtitle {
		font-weight: normal;
		font-size: 0.85em;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: center;
	}

	table th,
	table td {
		border: 1px solid #000;
		padding: 0.25rem;
	}

	.box {
		border: 1px solid #000;
		border-top: none;
		padding: 0.25rem;
		min-height: 2.5rem;
	}

	.box ul {
		margin: 0.25rem 0 0 1rem;
		padding: 0;
	}

	.bottom-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.bottom-row .equipment {
		border-right: none;
		min-height: 6rem;
	}

	.box-column {
		display: flex;
		flex-direction: column;
	}

	.box-column .box {
		flex: 1;
	}
</style>
