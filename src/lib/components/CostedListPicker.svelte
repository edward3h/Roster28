<script lang="ts">
	type Item = { id: string; name: string; cost: number; effect: string };

	let { items, selectedIds = $bindable([]) }: { items: Item[]; selectedIds: string[] } = $props();

	function toggle(id: string) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((i) => i !== id)
			: [...selectedIds, id];
	}
</script>

<ul class="costed-list">
	{#each items as item (item.id)}
		<li>
			<label>
				<input
					type="checkbox"
					checked={selectedIds.includes(item.id)}
					onchange={() => toggle(item.id)}
				/>
				<span class="name">{item.name}</span>
				<span class="cost">{item.cost >= 0 ? `+${item.cost}` : item.cost}pts</span>
				<span class="effect">{item.effect}</span>
			</label>
		</li>
	{/each}
</ul>

<style>
	.costed-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 16rem;
		overflow-y: auto;
		border: 1px solid var(--border-color, #ccc);
		padding: 0.5rem;
	}

	.costed-list li label {
		display: grid;
		grid-template-columns: auto 8rem 3.5rem 1fr;
		align-items: start;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.15rem 0;
	}

	.name {
		font-weight: 600;
	}

	.cost {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.effect {
		font-size: 0.85em;
		color: var(--muted-color, #555);
	}
</style>
