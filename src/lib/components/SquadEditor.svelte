<script lang="ts">
	import { characterCost, squadCost } from '$lib/model/points';
	import { MAX_SQUAD_SIZE, MIN_SQUAD_SIZE, type Squad } from '$lib/model/types';
	import CharacterEditor from './CharacterEditor.svelte';

	let { squad = $bindable() }: { squad: Squad } = $props();

	const profileCost = $derived(characterCost(squad.profile));
	const total = $derived(squadCost(squad));

	function adjustCount(delta: number) {
		const next = squad.memberCount + delta;
		if (next >= MIN_SQUAD_SIZE && next <= MAX_SQUAD_SIZE) {
			squad.memberCount = next;
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
			{profileCost} pts &times; {squad.memberCount} = <strong>{total}</strong> pts
		</div>
	</div>

	<p class="hint">All squad members share the profile below (skills, traits, abilities and equipment).</p>

	<CharacterEditor bind:profile={squad.profile} />
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
</style>
