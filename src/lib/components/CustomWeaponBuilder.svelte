<script lang="ts">
	import weaponSpecialRules from '$lib/data/weaponSpecialRules.json';
	import { customWeaponCost, maxPotentialDamage } from '$lib/model/points';
	import { generateId } from '$lib/model/id';
	import type { EquipmentItem } from '$lib/model/types';

	let { onAdd }: { onAdd: (item: EquipmentItem) => void } = $props();

	let name = $state('Custom weapon');
	let type: 'melee' | 'ranged' = $state('melee');
	let range = $state(0);
	let damage = $state('1D6');
	let oneHanded = $state(false);
	let specialRuleIds: string[] = $state([]);
	let keywordsInput = $state('');

	const damageValid = $derived(/^\d+D\d+([+-]\d+)?$/i.test(damage.trim()));
	const cost = $derived(
		damageValid
			? customWeaponCost({ range, damage: damage.trim(), oneHanded, specialRuleIds })
			: null
	);

	function toggleRule(id: string) {
		specialRuleIds = specialRuleIds.includes(id)
			? specialRuleIds.filter((r) => r !== id)
			: [...specialRuleIds, id];
	}

	function add() {
		if (!damageValid) return;
		const keywords = keywordsInput
			.split(',')
			.map((k) => k.trim())
			.filter(Boolean);

		onAdd({
			kind: 'customWeapon',
			id: generateId(),
			name,
			type,
			range,
			damage: damage.trim(),
			maxPotentialDamage: maxPotentialDamage(damage.trim()),
			oneHanded,
			specialRuleIds,
			keywords
		});

		// Reset for the next custom weapon.
		name = 'Custom weapon';
		type = 'melee';
		range = 0;
		damage = '1D6';
		oneHanded = false;
		specialRuleIds = [];
		keywordsInput = '';
	}
</script>

<div class="custom-weapon">
	<div class="row">
		<label>
			Name
			<input type="text" bind:value={name} />
		</label>
		<label>
			Type
			<select bind:value={type}>
				<option value="melee">Melee</option>
				<option value="ranged">Ranged</option>
			</select>
		</label>
		<label>
			Range (cm, 0 for melee)
			<input type="number" min="0" bind:value={range} />
		</label>
		<label>
			Damage dice (e.g. 2D10+4)
			<input type="text" bind:value={damage} class:invalid={!damageValid} />
		</label>
		<label>
			<input type="checkbox" bind:checked={oneHanded} />
			One-handed (+10)
		</label>
		<label>
			Keywords (comma separated)
			<input type="text" bind:value={keywordsInput} placeholder="Energy, Psychic..." />
		</label>
	</div>

	<fieldset>
		<legend>Special rules</legend>
		{#each weaponSpecialRules as rule (rule.id)}
			<label class="rule">
				<input
					type="checkbox"
					checked={specialRuleIds.includes(rule.id)}
					onchange={() => toggleRule(rule.id)}
				/>
				{rule.name} ({rule.cost >= 0 ? `+${rule.cost}` : rule.cost})
			</label>
		{/each}
	</fieldset>

	<div class="footer">
		<span class="cost">
			{#if cost !== null}
				Cost: {cost} credits
			{:else}
				Enter a valid damage dice value (e.g. 2D6, 1D4-1)
			{/if}
		</span>
		<button type="button" onclick={add} disabled={!damageValid}>Add custom weapon</button>
	</div>
</div>

<style>
	.custom-weapon {
		border: 1px solid var(--border-color, #ccc);
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.row label {
		display: flex;
		flex-direction: column;
		font-size: 0.85em;
		gap: 0.15rem;
	}

	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.rule {
		font-size: 0.85em;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.invalid {
		border-color: #c00;
	}
</style>
