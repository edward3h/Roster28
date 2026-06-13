import { describe, expect, it } from 'vitest';
import {
	abilityCost,
	characterCost,
	customWeaponCost,
	equipmentCost,
	hpCost,
	maxPotentialDamage,
	skillCost,
	squadCost,
	traitCost,
	warbandTotal
} from './points';
import { createCharacterProfile, type Squad, type Warband } from './types';

describe('skillCost', () => {
	it('costs nothing at the base level of 1', () => {
		expect(skillCost(1)).toBe(0);
	});

	it('costs 10 points per level above 1', () => {
		expect(skillCost(2)).toBe(10);
		expect(skillCost(5)).toBe(40);
	});

	it('costs 90 points at the maximum level of 10', () => {
		expect(skillCost(10)).toBe(90);
	});
});

describe('hpCost', () => {
	it('costs nothing at the base of 20', () => {
		expect(hpCost(20)).toBe(0);
	});

	it('costs 10 points per +2 hit-points', () => {
		expect(hpCost(22)).toBe(10);
		expect(hpCost(30)).toBe(50);
	});

	it('refunds 10 points per -2 hit-points', () => {
		expect(hpCost(18)).toBe(-10);
		expect(hpCost(10)).toBe(-50);
	});
});

describe('traitCost', () => {
	it('returns 0 for no traits', () => {
		expect(traitCost([])).toBe(0);
	});

	it('sums positive-cost traits', () => {
		expect(traitCost(['fast', 'brave'])).toBe(6 + 15);
	});

	it('handles traits with negative costs', () => {
		expect(traitCost(['animal'])).toBe(-20);
		expect(traitCost(['cursed'])).toBe(-50);
	});

	it('sums a mix of positive and negative cost traits', () => {
		expect(traitCost(['fast', 'animal'])).toBe(6 - 20);
	});
});

describe('abilityCost', () => {
	it('returns 0 for no abilities', () => {
		expect(abilityCost([])).toBe(0);
	});

	it('sums ability costs', () => {
		expect(abilityCost(['heal', 'aimed-shot'])).toBe(20 + 10);
	});
});

describe('maxPotentialDamage', () => {
	it('computes the worked example from the rulebook (2D10+4 -> 24)', () => {
		expect(maxPotentialDamage('2D10+4')).toBe(24);
	});

	it('handles negative modifiers', () => {
		expect(maxPotentialDamage('1D4-1')).toBe(3);
	});

	it('handles dice with no modifier', () => {
		expect(maxPotentialDamage('2D6')).toBe(12);
	});
});

describe('customWeaponCost', () => {
	it('combines range and max potential damage for a two-handed weapon', () => {
		expect(
			customWeaponCost({ range: 20, damage: '2D10+4', oneHanded: false, specialRuleIds: [] })
		).toBe(20 + 24);
	});

	it('adds 10 credits for a one-handed weapon', () => {
		expect(
			customWeaponCost({ range: 20, damage: '2D10+4', oneHanded: true, specialRuleIds: [] })
		).toBe(20 + 24 + 10);
	});

	it('adds the cost of special rules, including negative-cost rules', () => {
		expect(
			customWeaponCost({
				range: 0,
				damage: '1D6',
				oneHanded: false,
				specialRuleIds: ['armour-piercing', 'reload']
			})
		).toBe(0 + 6 + 30 - 15);
	});
});

describe('equipmentCost', () => {
	it('sums weapon, armour and item costs', () => {
		expect(
			equipmentCost([
				{ kind: 'weapon', id: '1', ref: 'laser-pistol' },
				{ kind: 'armour', id: '2', ref: 'ballistic-plate' },
				{ kind: 'item', id: '3', ref: 'med-kit' }
			])
		).toBe(25 + 15 + 15);
	});
});

describe('characterCost', () => {
	it('costs the base 10 points for an unmodified character', () => {
		const profile = createCharacterProfile();
		expect(characterCost(profile)).toBe(10);
	});

	it('adds skill, HP, trait, ability and equipment costs', () => {
		const profile = createCharacterProfile();
		profile.skills.F = 3; // +20
		profile.hp = 24; // +20
		profile.traitIds = ['fast']; // +6
		profile.abilityIds = ['heal']; // +20
		profile.equipment = [{ kind: 'weapon', id: '1', ref: 'dagger' }]; // +5

		expect(characterCost(profile)).toBe(10 + 20 + 20 + 6 + 20 + 5);
	});
});

describe('squadCost', () => {
	it('multiplies the profile cost plus standard loadout weapons by the member count (rulebook example: 250 x 4 = 1000)', () => {
		const profile = createCharacterProfile('Trooper');
		profile.skills = { A: 1, F: 1, S: 1, AW: 1, P: 1 };

		const squad: Squad = {
			id: 's1',
			name: 'Squad',
			profile,
			memberCount: 4,
			loadouts: [
				{
					id: 'l1',
					memberCount: 4,
					weapons: [
						{
							kind: 'customWeapon',
							id: '1',
							name: 'Test weapon',
							type: 'ranged',
							range: 100,
							damage: '1D6+134',
							maxPotentialDamage: 140,
							oneHanded: false,
							specialRuleIds: [],
							keywords: []
						}
					]
				}
			]
		};

		expect(characterCost(profile)).toBe(10);
		expect(squadCost(squad)).toBe(1000);
	});

	it('costs each loadout separately (rulebook example: squad of 8, 6 standard + 2 variant)', () => {
		const profile = createCharacterProfile('Trooper');

		const squad: Squad = {
			id: 's1',
			name: 'Squad',
			profile,
			memberCount: 8,
			loadouts: [
				{ id: 'standard', memberCount: 6, weapons: [{ kind: 'weapon', id: 'w1', ref: 'dagger' }] },
				{ id: 'variant', memberCount: 2, weapons: [{ kind: 'weapon', id: 'w2', ref: 'laser-pistol' }] }
			]
		};

		// dagger costs 5, laser-pistol costs 25; profile costs 10
		expect(squadCost(squad)).toBe((10 + 5) * 6 + (10 + 25) * 2);
	});
});

describe('warbandTotal', () => {
	it('sums character and squad costs', () => {
		const character = { ...createCharacterProfile('Solo'), id: 'c1' };
		const squadProfile = createCharacterProfile('Grunt');
		const squad: Squad = {
			id: 's1',
			name: 'Grunts',
			profile: squadProfile,
			memberCount: 3,
			loadouts: [{ id: 'l1', memberCount: 3, weapons: [] }]
		};

		const warband: Warband = {
			name: 'Test warband',
			pointsBudget: 500,
			entries: [
				{ type: 'character', data: character },
				{ type: 'squad', data: squad }
			]
		};

		// character costs 10, squad costs 10 * 3 = 30
		expect(warbandTotal(warband)).toBe(10 + 30);
	});
});
