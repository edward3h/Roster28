<script lang="ts">
	import { characterCost, squadCost, warbandTotal } from '$lib/model/points';
	import { exportWarband, importWarband } from '$lib/model/storage';
	import { createCharacterProfile, createSquad } from '$lib/model/types';
	import { generateId } from '$lib/model/id';
	import type { Warband, WarbandEntry } from '$lib/model/types';
	import CharacterEditor from './CharacterEditor.svelte';
	import EntrySummary from './EntrySummary.svelte';
	import PrintSheets from './PrintSheets.svelte';
	import SquadEditor from './SquadEditor.svelte';

	let { warband = $bindable() }: { warband: Warband } = $props();

	const total = $derived(warbandTotal(warband));
	const overBudget = $derived(total > warband.pointsBudget);

	/** ids of entries whose full editor is expanded; entries not in this set are collapsed to a summary. */
	let openIds = $state(new Set<string>());

	let fileInput: HTMLInputElement;
	let importError = $state('');

	function entryCost(entry: WarbandEntry): number {
		return entry.type === 'character' ? characterCost(entry.data) : squadCost(entry.data);
	}

	function addCharacter() {
		const data = { ...createCharacterProfile('New character'), id: generateId() };
		warband.entries = [...warband.entries, { type: 'character', data }];
		openIds.add(data.id);
	}

	function addSquad() {
		const data = createSquad('New squad');
		warband.entries = [...warband.entries, { type: 'squad', data }];
		openIds.add(data.id);
	}

	function removeEntry(index: number) {
		warband.entries = warband.entries.filter((_, i) => i !== index);
	}

	function doExport() {
		exportWarband(warband);
	}

	async function doImport(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			warband = await importWarband(file);
			importError = '';
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Failed to import warband.';
		}
		input.value = '';
	}

	function doPrint() {
		window.print();
	}
</script>

<div class="warband-editor">
	<header class="warband-header">
		<label class="name-field">
			Warband name
			<input type="text" bind:value={warband.name} />
		</label>

		<label class="budget-field">
			Points budget
			<input type="number" min="0" bind:value={warband.pointsBudget} />
		</label>

		<div class="total" class:over={overBudget}>
			Total: <strong>{total}</strong> / {warband.pointsBudget} pts
			{#if overBudget}<span class="warning">Over budget!</span>{/if}
		</div>
	</header>

	<div class="toolbar">
		<button type="button" onclick={addCharacter}>Add character</button>
		<button type="button" onclick={addSquad}>Add squad</button>
		<button type="button" onclick={doExport}>Export JSON</button>
		<button type="button" onclick={() => fileInput.click()}>Import JSON</button>
		<input
			bind:this={fileInput}
			type="file"
			accept="application/json"
			class="hidden"
			onchange={doImport}
		/>
		<button type="button" onclick={doPrint}>Print sheets</button>
	</div>

	{#if importError}
		<p class="error">{importError}</p>
	{/if}

	<div class="entries">
		{#each warband.entries as entry, index (entry.data.id)}
			<details
				class="entry"
				open={openIds.has(entry.data.id)}
				ontoggle={(e) => {
					if (e.currentTarget.open) openIds.add(entry.data.id);
					else openIds.delete(entry.data.id);
				}}
			>
				<summary>
					<div class="summary-header">
						{entry.data.name} ({entry.type === 'squad' ? `squad, ` : ''}{entryCost(entry)} pts)
						<button
							type="button"
							class="remove"
							onclick={(e) => {
								e.preventDefault();
								removeEntry(index);
							}}>Remove</button
						>
					</div>
					<EntrySummary {entry} />
				</summary>
				{#if entry.type === 'character'}
					<CharacterEditor bind:profile={entry.data} />
				{:else}
					<SquadEditor bind:squad={entry.data} />
				{/if}
			</details>
		{/each}

		{#if warband.entries.length === 0}
			<p class="empty">No characters or squads yet. Add one to get started.</p>
		{/if}
	</div>
</div>

<PrintSheets {warband} />

<style>
	.warband-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media print {
		.warband-editor {
			display: none;
		}
	}

	.warband-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
	}

	.name-field,
	.budget-field {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.name-field input {
		font-size: 1.2em;
		font-weight: 600;
	}

	.budget-field input {
		width: 6rem;
	}

	.total {
		font-size: 1.1em;
	}

	.total.over {
		color: #c00;
	}

	.warning {
		font-weight: 600;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.hidden {
		display: none;
	}

	.error {
		color: #c00;
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entry {
		border: 1px solid var(--border-color, #ccc);
		padding: 0.5rem;
	}

	.entry summary {
		cursor: pointer;
	}

	.entry summary .summary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
	}

	.entry summary .remove {
		font-weight: normal;
	}

	.empty {
		color: var(--muted-color, #555);
	}
</style>
