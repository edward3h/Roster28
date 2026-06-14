<script lang="ts">
	import { equipmentCost } from '$lib/model/points';
	import type { WeaponLoadout } from '$lib/model/types';
	import EquipmentPicker from './EquipmentPicker.svelte';

	let {
		loadout = $bindable(),
		label,
		baseCost,
		showStepper = false,
		canIncrement = false,
		canDecrement = false,
		onIncrement,
		onDecrement,
		removable = false,
		onRemove
	}: {
		loadout: WeaponLoadout;
		label: string;
		baseCost: number;
		showStepper?: boolean;
		canIncrement?: boolean;
		canDecrement?: boolean;
		onIncrement?: () => void;
		onDecrement?: () => void;
		removable?: boolean;
		onRemove?: () => void;
	} = $props();

	const cost = $derived(baseCost + equipmentCost(loadout.weapons));
</script>

<div class="weapon-loadout">
	<div class="loadout-header">
		<span class="label">{label}</span>

		{#if showStepper}
			<div class="stepper">
				<button type="button" onclick={onDecrement} disabled={!canDecrement} aria-label="Fewer members with {label}"
					>-</button
				>
				<span class="value">{loadout.memberCount}</span>
				<button type="button" onclick={onIncrement} disabled={!canIncrement} aria-label="More members with {label}"
					>+</button
				>
			</div>
		{:else}
			<span class="value">{loadout.memberCount} members</span>
		{/if}

		<span class="cost">{cost} pts each</span>

		{#if removable}
			<button type="button" onclick={onRemove} aria-label="Remove {label}">&times;</button>
		{/if}
	</div>

	<EquipmentPicker bind:equipment={loadout.weapons} categories={['weapon']} />
</div>

<style>
	.weapon-loadout {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border: 1px solid var(--muted-color, #ccc);
		border-radius: 0.25rem;
		padding: 0.5rem;
	}

	.loadout-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.label {
		font-weight: 600;
		flex: 1;
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

	.cost {
		font-size: 0.85em;
		color: var(--muted-color, #555);
		white-space: nowrap;
	}
</style>
