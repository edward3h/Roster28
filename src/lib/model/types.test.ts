import { describe, expect, it } from 'vitest';
import {
	createSquad,
	majorityMinimum,
	maxVariantMembers,
	normalizeSquad,
	rebalanceLoadouts,
	type Squad
} from './types';

describe('maxVariantMembers', () => {
	it('allows 2 variant members in a squad of 8 (rulebook example)', () => {
		expect(maxVariantMembers(8)).toBe(2);
	});

	it('allows no variant members in a squad of 3', () => {
		expect(maxVariantMembers(3)).toBe(0);
	});

	it('allows 1 variant member in a squad of 4', () => {
		expect(maxVariantMembers(4)).toBe(1);
	});

	it('allows 2 variant members in a squad of 10', () => {
		expect(maxVariantMembers(10)).toBe(2);
	});
});

describe('majorityMinimum', () => {
	it('requires at least 6 standard members in a squad of 8 (rulebook example)', () => {
		expect(majorityMinimum(8)).toBe(6);
	});

	it('requires all 3 members to match in a squad of 3', () => {
		expect(majorityMinimum(3)).toBe(3);
	});
});

describe('createSquad', () => {
	it('creates a squad with a single standard loadout covering every member', () => {
		const squad = createSquad();

		expect(squad.memberCount).toBe(3);
		expect(squad.loadouts).toHaveLength(1);
		expect(squad.loadouts[0].memberCount).toBe(squad.memberCount);
		expect(squad.loadouts[0].weapons).toEqual([]);
		expect(squad.profile.equipment).toEqual([]);
	});
});

describe('rebalanceLoadouts', () => {
	it('grows the standard loadout when member count increases', () => {
		const squad: Squad = {
			...createSquad(),
			memberCount: 8,
			loadouts: [{ id: 'standard', memberCount: 3, weapons: [] }]
		};

		expect(rebalanceLoadouts(squad)).toEqual([{ id: 'standard', memberCount: 8, weapons: [] }]);
	});

	it('shrinks the standard loadout when member count decreases and the variant still fits', () => {
		const squad: Squad = {
			...createSquad(),
			memberCount: 4,
			loadouts: [
				{ id: 'standard', memberCount: 6, weapons: [] },
				{ id: 'variant', memberCount: 2, weapons: [] }
			]
		};

		// maxVariantMembers(4) = 1, so the variant must shrink from 2 to 1
		expect(rebalanceLoadouts(squad)).toEqual([
			{ id: 'standard', memberCount: 3, weapons: [] },
			{ id: 'variant', memberCount: 1, weapons: [] }
		]);
	});

	it('removes variant loadouts entirely once member count is too small to allow any', () => {
		const squad: Squad = {
			...createSquad(),
			memberCount: 3,
			loadouts: [
				{ id: 'standard', memberCount: 2, weapons: [] },
				{ id: 'variant', memberCount: 1, weapons: [] }
			]
		};

		// maxVariantMembers(3) = 0, so the variant is removed entirely
		expect(rebalanceLoadouts(squad)).toEqual([{ id: 'standard', memberCount: 3, weapons: [] }]);
	});
});

describe('normalizeSquad', () => {
	it('leaves a squad with loadouts unchanged', () => {
		const squad: Squad = {
			id: 's1',
			name: 'Squad',
			profile: { ...createSquad().profile, equipment: [] },
			memberCount: 4,
			loadouts: [{ id: 'l1', memberCount: 4, weapons: [{ kind: 'weapon', id: 'w1', ref: 'dagger' }] }]
		};

		expect(normalizeSquad(squad)).toBe(squad);
	});

	it('splits an old-shape squad profile into a single standard loadout', () => {
		const oldShapeSquad = {
			id: 's1',
			name: 'Squad',
			memberCount: 4,
			profile: {
				...createSquad().profile,
				equipment: [
					{ kind: 'weapon', id: 'w1', ref: 'dagger' },
					{ kind: 'armour', id: 'a1', ref: 'flak-vest' }
				]
			}
		} as unknown as Squad;

		const normalized = normalizeSquad(oldShapeSquad);

		expect(normalized.profile.equipment).toEqual([{ kind: 'armour', id: 'a1', ref: 'flak-vest' }]);
		expect(normalized.loadouts).toEqual([
			{
				id: expect.any(String),
				memberCount: 4,
				weapons: [{ kind: 'weapon', id: 'w1', ref: 'dagger' }]
			}
		]);
	});
});
