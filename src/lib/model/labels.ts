import abilitiesData from '$lib/data/abilities.json';
import armourData from '$lib/data/armour.json';
import miscItemsData from '$lib/data/miscItems.json';
import traitsData from '$lib/data/traits.json';
import weaponSpecialRulesData from '$lib/data/weaponSpecialRules.json';
import weaponsData from '$lib/data/weapons.json';
import type { EquipmentItem } from './types';

export const traitNames = new Map(traitsData.map((t) => [t.id, t.name]));
export const abilityNames = new Map(abilitiesData.map((a) => [a.id, a.name]));
export const weaponNames = new Map(weaponsData.map((w) => [w.id, w.name]));
export const armourNames = new Map(armourData.map((a) => [a.id, a.name]));
export const itemNames = new Map(miscItemsData.map((i) => [i.id, i.name]));

const weaponsById = new Map(weaponsData.map((w) => [w.id, w]));
const armourById = new Map(armourData.map((a) => [a.id, a]));
const itemsById = new Map(miscItemsData.map((i) => [i.id, i]));
const weaponSpecialRuleNames = new Map(weaponSpecialRulesData.map((r) => [r.id, r.name]));

function weaponDetails(
	range: number | null,
	damage: string,
	specialRuleIds: string[]
): string {
	const parts = [`Range: ${range ? `${range}cm` : 'Melee'}`, `Damage: ${damage}`];
	if (specialRuleIds.length) {
		parts.push(specialRuleIds.map((id) => weaponSpecialRuleNames.get(id) ?? id).join(', '));
	}
	return parts.join(' · ');
}

/** Returns rules-relevant details (range, damage, defence, special rules etc.) for an
 *  equipment item, suitable for display on a print sheet. Returns '' if there's nothing to show. */
export function equipmentDetails(item: EquipmentItem): string {
	switch (item.kind) {
		case 'weapon': {
			const weapon = weaponsById.get(item.ref);
			if (!weapon) return '';
			return weaponDetails(weapon.range, weapon.damage, weapon.specialRules);
		}
		case 'customWeapon':
			return weaponDetails(item.range || null, item.damage, item.specialRuleIds);
		case 'armour': {
			const armour = armourById.get(item.ref);
			if (!armour) return '';
			const parts = [];
			if (armour.defence) parts.push(`Defence: ${armour.defence}`);
			if (armour.details) parts.push(armour.details);
			return parts.join(' · ');
		}
		case 'item':
			return itemsById.get(item.ref)?.description ?? '';
	}
}

export function equipmentLabel(item: EquipmentItem): string {
	switch (item.kind) {
		case 'weapon':
			return weaponNames.get(item.ref) ?? item.ref;
		case 'armour':
			return armourNames.get(item.ref) ?? item.ref;
		case 'item':
			return itemNames.get(item.ref) ?? item.ref;
		case 'customWeapon':
			return `${item.name} (custom, ${item.damage}${item.range ? `, ${item.range}cm` : ''})`;
	}
}
