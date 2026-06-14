<script lang="ts">
	import abilitiesData from '$lib/data/abilities.json';
	import traitsData from '$lib/data/traits.json';
	import { characterCost, hpCost, skillCost } from '$lib/model/points';
	import {
		BASE_HP,
		BASE_SKILL,
		MAX_SKILL,
		SKILL_KEYS,
		type CharacterProfile,
		type SkillKey
	} from '$lib/model/types';
	import CostedListPicker from './CostedListPicker.svelte';
	import EquipmentPicker from './EquipmentPicker.svelte';

	let {
		profile = $bindable(),
		categories = ['weapon', 'armour', 'item'],
		showName = true
	}: {
		profile: CharacterProfile;
		categories?: ('weapon' | 'armour' | 'item')[];
		showName?: boolean;
	} = $props();

	const cost = $derived(characterCost(profile));

	const skillLabels: Record<SkillKey, string> = {
		A: 'Agility',
		F: 'Fighting',
		S: 'Shooting',
		AW: 'Awareness',
		P: 'Psyche'
	};

	const HP_STEP = 2;

	function adjustSkill(key: SkillKey, delta: number) {
		const next = profile.skills[key] + delta;
		if (next >= BASE_SKILL && next <= MAX_SKILL) {
			profile.skills = { ...profile.skills, [key]: next };
		}
	}

	function adjustHp(delta: number) {
		const next = profile.hp + delta;
		if (next > 0) {
			profile.hp = next;
		}
	}
</script>

<div class="character-editor">
	<div class="header">
		{#if showName}
			<label class="name-field">
				Name
				<input type="text" bind:value={profile.name} />
			</label>
		{/if}
		<div class="cost-summary">Cost: <strong>{cost}</strong> pts</div>
	</div>

	<label class="background">
		Background
		<textarea bind:value={profile.background} rows="2"></textarea>
	</label>

	<div class="skills">
		{#each SKILL_KEYS as key (key)}
			<div class="skill">
				<span class="skill-label">{skillLabels[key]} ({key})</span>
				<div class="stepper">
					<button
						type="button"
						onclick={() => adjustSkill(key, -1)}
						disabled={profile.skills[key] <= BASE_SKILL}>-</button
					>
					<span class="value">{profile.skills[key]}</span>
					<button
						type="button"
						onclick={() => adjustSkill(key, 1)}
						disabled={profile.skills[key] >= MAX_SKILL}>+</button
					>
				</div>
				<span class="skill-cost">{skillCost(profile.skills[key])} pts</span>
			</div>
		{/each}

		<div class="skill">
			<span class="skill-label">Hit-points</span>
			<div class="stepper">
				<button type="button" onclick={() => adjustHp(-HP_STEP)} disabled={profile.hp <= HP_STEP}
					>-</button
				>
				<span class="value">{profile.hp}</span>
				<button type="button" onclick={() => adjustHp(HP_STEP)}>+</button>
			</div>
			<span class="skill-cost">{hpCost(profile.hp)} pts</span>
		</div>

		<div class="skill">
			<span class="skill-label">Speed</span>
			<span class="value fixed">10cm (fixed)</span>
			<span class="skill-cost"></span>
		</div>
	</div>

	<section>
		<h4>Traits</h4>
		<CostedListPicker items={traitsData} bind:selectedIds={profile.traitIds} />
	</section>

	<section>
		<h4>Abilities</h4>
		<CostedListPicker items={abilitiesData} bind:selectedIds={profile.abilityIds} />
	</section>

	<section>
		<h4>Equipment</h4>
		<EquipmentPicker bind:equipment={profile.equipment} {categories} />
	</section>
</div>

<style>
	.character-editor {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
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

	.cost-summary {
		font-size: 1.1em;
		white-space: nowrap;
	}

	.background {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.skill {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		min-width: 6rem;
	}

	.skill-label {
		font-size: 0.8em;
		font-weight: 600;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.stepper .value,
	.value.fixed {
		min-width: 2rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.skill-cost {
		font-size: 0.75em;
		color: var(--muted-color, #555);
	}

	h4 {
		margin: 0 0 0.25rem 0;
	}
</style>
