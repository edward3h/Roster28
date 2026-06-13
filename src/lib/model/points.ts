import abilities from '$lib/data/abilities.json';
import armour from '$lib/data/armour.json';
import miscItems from '$lib/data/miscItems.json';
import traits from '$lib/data/traits.json';
import weaponSpecialRules from '$lib/data/weaponSpecialRules.json';
import weapons from '$lib/data/weapons.json';
import {
	BASE_HP,
	BASE_SKILL,
	SKILL_KEYS,
	type CharacterProfile,
	type EquipmentItem,
	type Squad,
	type Warband
} from './types';

const COST_PER_SKILL_LEVEL = 10;
const COST_PER_HP_STEP = 10;
const HP_STEP = 2;
const CHARACTER_BASE_COST = 10;
const ONE_HANDED_DISCOUNT_COST = 10;

const traitCosts = new Map(traits.map((t) => [t.id, t.cost]));
const abilityCosts = new Map(abilities.map((a) => [a.id, a.cost]));
const weaponCosts = new Map(weapons.map((w) => [w.id, w.cost]));
const armourCosts = new Map(armour.map((a) => [a.id, a.cost]));
const itemCosts = new Map(miscItems.map((i) => [i.id, i.cost]));
const specialRuleCosts = new Map(weaponSpecialRules.map((r) => [r.id, r.cost]));

/** Cost in points to raise a skill from its base value of 1 to the given level. */
export function skillCost(level: number): number {
	return (level - BASE_SKILL) * COST_PER_SKILL_LEVEL;
}

/** Cost in points for a character's hit-points, relative to the base of 20.
 *  Increasing HP by 2 costs 10 points; decreasing HP by 2 refunds 10 points. */
export function hpCost(hp: number): number {
	return ((hp - BASE_HP) / HP_STEP) * COST_PER_HP_STEP;
}

/** Sum of trait costs (some traits have negative costs). */
export function traitCost(traitIds: string[]): number {
	return traitIds.reduce((sum, id) => sum + (traitCosts.get(id) ?? 0), 0);
}

/** Sum of ability costs. */
export function abilityCost(abilityIds: string[]): number {
	return abilityIds.reduce((sum, id) => sum + (abilityCosts.get(id) ?? 0), 0);
}

/** Parses a damage dice string like "2D10+4" or "1D4-1" and returns the maximum
 *  possible result (all dice rolling their highest value, plus/minus the modifier). */
export function maxPotentialDamage(damageDice: string): number {
	const match = damageDice.match(/^(\d+)D(\d+)([+-]\d+)?$/i);
	if (!match) {
		throw new Error(`Invalid damage dice: ${damageDice}`);
	}
	const [, count, sides, modifier] = match;
	return Number(count) * Number(sides) + (modifier ? Number(modifier) : 0);
}

export type CustomWeaponSpec = {
	range: number;
	damage: string;
	oneHanded: boolean;
	specialRuleIds: string[];
};

/** Cost of a custom weapon: range + max potential damage, +10 if one-handed,
 *  plus the cost of any special rules. */
export function customWeaponCost(spec: CustomWeaponSpec): number {
	const base = spec.range + maxPotentialDamage(spec.damage);
	const handednessCost = spec.oneHanded ? ONE_HANDED_DISCOUNT_COST : 0;
	const specialRulesCost = spec.specialRuleIds.reduce(
		(sum, id) => sum + (specialRuleCosts.get(id) ?? 0),
		0
	);
	return base + handednessCost + specialRulesCost;
}

/** Cost of a single piece of equipment, in credits/points. */
export function equipmentItemCost(item: EquipmentItem): number {
	switch (item.kind) {
		case 'weapon':
			return weaponCosts.get(item.ref) ?? 0;
		case 'armour':
			return armourCosts.get(item.ref) ?? 0;
		case 'item':
			return itemCosts.get(item.ref) ?? 0;
		case 'customWeapon':
			return customWeaponCost(item);
	}
}

/** Total cost of a character's equipment. */
export function equipmentCost(equipment: EquipmentItem[]): number {
	return equipment.reduce((sum, item) => sum + equipmentItemCost(item), 0);
}

/** Total points cost of a character profile: base cost + skills + HP + traits +
 *  abilities + equipment. */
export function characterCost(profile: CharacterProfile): number {
	const skillsCost = SKILL_KEYS.reduce((sum, key) => sum + skillCost(profile.skills[key]), 0);
	return (
		CHARACTER_BASE_COST +
		skillsCost +
		hpCost(profile.hp) +
		traitCost(profile.traitIds) +
		abilityCost(profile.abilityIds) +
		equipmentCost(profile.equipment)
	);
}

/** Total points cost of a squad: the shared profile's cost, multiplied by the
 *  number of members. */
export function squadCost(squad: Squad): number {
	return characterCost(squad.profile) * squad.memberCount;
}

/** Total points cost of an entire warband. */
export function warbandTotal(warband: Warband): number {
	return warband.entries.reduce((sum, entry) => {
		return sum + (entry.type === 'character' ? characterCost(entry.data) : squadCost(entry.data));
	}, 0);
}
