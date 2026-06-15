import { describe, expect, it } from 'vitest';
import { equipmentDetails } from './labels';
import type { EquipmentItem } from './types';

describe('equipmentDetails', () => {
	it('describes a ranged weapon with range, damage and special rules', () => {
		const item: EquipmentItem = { kind: 'weapon', id: '1', ref: 'missile-launcher' };
		expect(equipmentDetails(item)).toBe(
			'Range: 40cm · Damage: 3D10+5 · Armour piercing, Explosive, Reload'
		);
	});

	it('describes a melee weapon as Melee range with no special rules suffix', () => {
		const item: EquipmentItem = { kind: 'weapon', id: '1', ref: 'club' };
		expect(equipmentDetails(item)).toBe('Range: Melee · Damage: 1D4');
	});

	it('describes a custom ranged weapon from its own fields', () => {
		const item: EquipmentItem = {
			kind: 'customWeapon',
			id: '1',
			name: 'Doom stick',
			type: 'ranged',
			range: 20,
			damage: '2D6+1',
			maxPotentialDamage: 13,
			oneHanded: false,
			specialRuleIds: ['armour-piercing'],
			keywords: []
		};
		expect(equipmentDetails(item)).toBe('Range: 20cm · Damage: 2D6+1 · Armour piercing');
	});

	it('describes a custom melee weapon with range 0 as Melee', () => {
		const item: EquipmentItem = {
			kind: 'customWeapon',
			id: '1',
			name: 'Doom stick',
			type: 'melee',
			range: 0,
			damage: '2D6+1',
			maxPotentialDamage: 13,
			oneHanded: false,
			specialRuleIds: [],
			keywords: []
		};
		expect(equipmentDetails(item)).toBe('Range: Melee · Damage: 2D6+1');
	});

	it('describes armour with defence and details text', () => {
		const item: EquipmentItem = { kind: 'armour', id: '1', ref: 'light-armour' };
		expect(equipmentDetails(item)).toBe(
			'Defence: 1D6 · Provides no protection against weapons with the Energy keyword.'
		);
	});

	it('describes armour with no details text using only defence', () => {
		const item: EquipmentItem = { kind: 'armour', id: '1', ref: 'ballistic-plate' };
		expect(equipmentDetails(item)).toBe('Defence: 1D8+4');
	});

	it('describes armour with no defence value using only details', () => {
		const item: EquipmentItem = { kind: 'armour', id: '1', ref: 'psy-hood' };
		expect(equipmentDetails(item)).toBe(
			'The wearer of this armour cannot be targeted by arcane abilities or weapons with the Psychic keyword.'
		);
	});

	it('describes a misc item with its description', () => {
		const item: EquipmentItem = { kind: 'item', id: '1', ref: 'med-kit' };
		expect(equipmentDetails(item)).toBe('A single med kit. When used, restores 5 hit-points.');
	});

	it('returns an empty string for an unknown reference', () => {
		const item: EquipmentItem = { kind: 'item', id: '1', ref: 'nonexistent' };
		expect(equipmentDetails(item)).toBe('');
	});
});
