import abilitiesData from '$lib/data/abilities.json';
import armourData from '$lib/data/armour.json';
import miscItemsData from '$lib/data/miscItems.json';
import traitsData from '$lib/data/traits.json';
import weaponsData from '$lib/data/weapons.json';
import type { EquipmentItem } from './types';

export const traitNames = new Map(traitsData.map((t) => [t.id, t.name]));
export const abilityNames = new Map(abilitiesData.map((a) => [a.id, a.name]));
export const weaponNames = new Map(weaponsData.map((w) => [w.id, w.name]));
export const armourNames = new Map(armourData.map((a) => [a.id, a.name]));
export const itemNames = new Map(miscItemsData.map((i) => [i.id, i.name]));

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
