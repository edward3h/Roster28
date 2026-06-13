<script lang="ts">
	import armour from '$lib/data/armour.json';
	import miscItems from '$lib/data/miscItems.json';
	import weapons from '$lib/data/weapons.json';
	import { equipmentItemCost } from '$lib/model/points';
	import { generateId } from '$lib/model/id';
	import type { EquipmentItem } from '$lib/model/types';
	import CustomWeaponBuilder from './CustomWeaponBuilder.svelte';

	let { equipment = $bindable([]) }: { equipment: EquipmentItem[] } = $props();

	type Category = 'weapon' | 'armour' | 'item';

	const catalogues: Record<Category, { id: string; name: string; cost: number }[]> = {
		weapon: weapons,
		armour,
		item: miscItems
	};

	let category: Category = $state('weapon');
	let selectedRef = $state(weapons[0].id);
	let showCustomWeapon = $state(false);

	$effect(() => {
		selectedRef = catalogues[category][0]?.id ?? '';
	});

	function describe(item: EquipmentItem): { name: string; cost: number } {
		if (item.kind === 'customWeapon') {
			return { name: `${item.name} (custom)`, cost: equipmentItemCost(item) };
		}
		const catalogue = catalogues[item.kind];
		const entry = catalogue.find((c) => c.id === item.ref);
		return { name: entry?.name ?? item.ref, cost: equipmentItemCost(item) };
	}

	function addFromCatalogue() {
		if (!selectedRef) return;
		equipment = [...equipment, { kind: category, id: generateId(), ref: selectedRef }];
	}

	function addCustomWeapon(item: EquipmentItem) {
		equipment = [...equipment, item];
		showCustomWeapon = false;
	}

	function remove(id: string) {
		equipment = equipment.filter((item) => item.id !== id);
	}
</script>

<div class="equipment-picker">
	<ul class="equipment-list">
		{#each equipment as item (item.id)}
			{@const { name, cost } = describe(item)}
			<li>
				<span class="name">{name}</span>
				<span class="cost">{cost}</span>
				<button type="button" onclick={() => remove(item.id)} aria-label="Remove {name}"
					>&times;</button
				>
			</li>
		{/each}
		{#if equipment.length === 0}
			<li class="empty">No equipment.</li>
		{/if}
	</ul>

	<div class="add-row">
		<select bind:value={category}>
			<option value="weapon">Weapon</option>
			<option value="armour">Armour</option>
			<option value="item">Item</option>
		</select>
		<select bind:value={selectedRef}>
			{#each catalogues[category] as entry (entry.id)}
				<option value={entry.id}>{entry.name} ({entry.cost})</option>
			{/each}
		</select>
		<button type="button" onclick={addFromCatalogue}>Add</button>
		<button type="button" onclick={() => (showCustomWeapon = !showCustomWeapon)}>
			{showCustomWeapon ? 'Cancel custom weapon' : 'Create custom weapon'}
		</button>
	</div>

	{#if showCustomWeapon}
		<CustomWeaponBuilder onAdd={addCustomWeapon} />
	{/if}
</div>

<style>
	.equipment-picker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.equipment-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.equipment-list li {
		display: grid;
		grid-template-columns: 1fr 3rem 1.5rem;
		align-items: center;
		gap: 0.5rem;
	}

	.equipment-list .empty {
		color: var(--muted-color, #555);
		font-size: 0.85em;
	}

	.cost {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.add-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
