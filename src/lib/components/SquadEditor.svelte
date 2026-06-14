<script lang="ts">
	import { characterCost, equipmentCost, squadCost } from '$lib/model/points';
	import { generateId } from '$lib/model/id';
	import {
		MAX_SQUAD_SIZE,
		MIN_SQUAD_SIZE,
		majorityMinimum,
		maxVariantMembers,
		rebalanceLoadouts,
		type Squad
	} from '$lib/model/types';
	import CharacterEditor from './CharacterEditor.svelte';
	import WeaponLoadoutEditor from './WeaponLoadoutEditor.svelte';

	let { squad = $bindable() }: { squad: Squad } = $props();

	const baseCost = $derived(characterCost(squad.profile));
	const total = $derived(squadCost(squad));
	const maxVariant = $derived(maxVariantMembers(squad.memberCount));
	const canAddVariant = $derived(squad.loadouts[0].memberCount > majorityMinimum(squad.memberCount));

	function adjustCount(delta: number) {
		const next = squad.memberCount + delta;
		if (next >= MIN_SQUAD_SIZE && next <= MAX_SQUAD_SIZE) {
			squad.memberCount = next;
			squad.loadouts = rebalanceLoadouts(squad);
		}
	}

	function addVariant() {
		if (!canAddVariant) return;
		squad.loadouts[0].memberCount -= 1;
		squad.loadouts = [...squad.loadouts, { id: generateId(), memberCount: 1, weapons: [] }];
	}

	function removeVariant(index: number) {
		squad.loadouts[0].memberCount += squad.loadouts[index].memberCount;
		squad.loadouts = squad.loadouts.filter((_, i) => i !== index);
	}

	function incrementVariant(index: number) {
		if (squad.loadouts[0].memberCount <= majorityMinimum(squad.memberCount)) return;
		squad.loadouts[0].memberCount -= 1;
		squad.loadouts[index].memberCount += 1;
	}

	function decrementVariant(index: number) {
		const loadout = squad.loadouts[index];
		if (loadout.memberCount <= 1) {
			removeVariant(index);
		} else {
			loadout.memberCount -= 1;
			squad.loadouts[0].memberCount += 1;
		}
	}
</script>

<div class="squad-editor">
	<div class="header">
		<label class="name-field">
			Squad name
			<input type="text" bind:value={squad.name} />
		</label>

		<div class="member-count">
			<span>Members</span>
			<div class="stepper">
				<button
					type="button"
					onclick={() => adjustCount(-1)}
					disabled={squad.memberCount <= MIN_SQUAD_SIZE}>-</button
				>
				<span class="value">{squad.memberCount}</span>
				<button
					type="button"
					onclick={() => adjustCount(1)}
					disabled={squad.memberCount >= MAX_SQUAD_SIZE}>+</button
				>
			</div>
		</div>

		<div class="cost-summary">
			{#each squad.loadouts as loadout, i (loadout.id)}
				{baseCost + equipmentCost(loadout.weapons)} &times; {loadout.memberCount}{#if i < squad.loadouts.length - 1}
					{' '}+{' '}
				{/if}
			{/each}
			= <strong>{total}</strong> pts
		</div>
	</div>

	<p class="hint">
		All squad members share the profile below (skills, traits, abilities, armour and items).
	</p>

	<CharacterEditor bind:profile={squad.profile} categories={['armour', 'item']} showName={false} />

	<section class="loadouts">
		<h4>Weapon loadouts</h4>

		{#each squad.loadouts as loadout, i (loadout.id)}
			<WeaponLoadoutEditor
				bind:loadout={squad.loadouts[i]}
				label={i === 0 ? 'Standard weapons' : `Variant ${i}`}
				{baseCost}
				showStepper={i > 0}
				canIncrement={squad.loadouts[0].memberCount > majorityMinimum(squad.memberCount)}
				canDecrement={loadout.memberCount > 0}
				onIncrement={() => incrementVariant(i)}
				onDecrement={() => decrementVariant(i)}
				removable={i > 0}
				onRemove={() => removeVariant(i)}
			/>
		{/each}

		<button type="button" onclick={addVariant} disabled={!canAddVariant}>
			Add weapon variant
		</button>

		{#if maxVariant === 0}
			<p class="hint">Squads of this size must all use the same weapons.</p>
		{:else}
			<p class="hint">
				Up to {maxVariant} member{maxVariant === 1 ? '' : 's'} may use different weapons from the
				rest of the squad.
			</p>
		{/if}
	</section>
</div>

<style>
	.squad-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}

	.name-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.name-field input {
		flex: 1;
		font-size: 1.1em;
		font-weight: 600;
	}

	.member-count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.stepper .value {
		min-width: 1.5rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.cost-summary {
		font-size: 1.1em;
		white-space: nowrap;
	}

	.hint {
		font-size: 0.85em;
		color: var(--muted-color, #555);
		margin: 0;
	}

	.loadouts {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.loadouts h4 {
		margin: 0;
	}
</style>
