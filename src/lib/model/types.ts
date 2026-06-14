import { generateId } from './id';

/** Core skills: Agility, Fighting, Shooting, Awareness, Psyche. Each starts at 1, max 10. */
export type Skills = {
	A: number;
	F: number;
	S: number;
	AW: number;
	P: number;
};

export const SKILL_KEYS = ['A', 'F', 'S', 'AW', 'P'] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export type WeaponSpecialRuleId = string;

export type EquipmentItem =
	| { kind: 'weapon'; id: string; ref: string }
	| { kind: 'armour'; id: string; ref: string }
	| { kind: 'item'; id: string; ref: string }
	| {
			kind: 'customWeapon';
			id: string;
			name: string;
			type: 'melee' | 'ranged';
			range: number;
			damage: string;
			maxPotentialDamage: number;
			oneHanded: boolean;
			specialRuleIds: WeaponSpecialRuleId[];
			keywords: string[];
	  };

export type CharacterProfile = {
	name: string;
	background: string;
	skills: Skills;
	hp: number;
	traitIds: string[];
	abilityIds: string[];
	equipment: EquipmentItem[];
};

export type Character = CharacterProfile & {
	id: string;
};

export type WeaponLoadout = {
	id: string;
	memberCount: number;
	/** Only 'weapon' and 'customWeapon' items belong here. */
	weapons: EquipmentItem[];
};

export type Squad = {
	id: string;
	name: string;
	/** equipment here holds only 'armour' and 'item' entries, shared by every member. */
	profile: CharacterProfile;
	memberCount: number;
	/** loadouts[0] is the standard (majority) loadout; the rest are variants. */
	loadouts: WeaponLoadout[];
};

export type WarbandEntry = { type: 'character'; data: Character } | { type: 'squad'; data: Squad };

export type Warband = {
	name: string;
	pointsBudget: number;
	entries: WarbandEntry[];
};

export const BASE_SKILL = 1;
export const MAX_SKILL = 10;
export const BASE_HP = 20;
export const MIN_SQUAD_SIZE = 3;
export const MAX_SQUAD_SIZE = 10;

/** Number of squad members (rounded down) who may wield weapons different from the rest. */
export function maxVariantMembers(memberCount: number): number {
	return Math.floor(memberCount * 0.25);
}

/** Minimum number of squad members (rounded up) who must share the standard weapons. */
export function majorityMinimum(memberCount: number): number {
	return memberCount - maxVariantMembers(memberCount);
}

export function createCharacterProfile(name = 'New character'): CharacterProfile {
	return {
		name,
		background: '',
		skills: { A: BASE_SKILL, F: BASE_SKILL, S: BASE_SKILL, AW: BASE_SKILL, P: BASE_SKILL },
		hp: BASE_HP,
		traitIds: [],
		abilityIds: [],
		equipment: []
	};
}

export function createSquad(name = 'New squad'): Squad {
	return {
		id: generateId(),
		name,
		profile: createCharacterProfile('Squad member'),
		memberCount: MIN_SQUAD_SIZE,
		loadouts: [{ id: generateId(), memberCount: MIN_SQUAD_SIZE, weapons: [] }]
	};
}

/** Returns squad.loadouts adjusted to fit squad.memberCount: the standard loadout
 *  (loadouts[0]) absorbs growth, and variant loadouts are shrunk/removed from the
 *  end if they no longer fit within maxVariantMembers. */
export function rebalanceLoadouts(squad: Squad): WeaponLoadout[] {
	const maxVariant = maxVariantMembers(squad.memberCount);
	const loadouts = squad.loadouts.map((loadout) => ({ ...loadout }));

	let variantTotal = loadouts.slice(1).reduce((sum, loadout) => sum + loadout.memberCount, 0);
	for (let i = loadouts.length - 1; i >= 1 && variantTotal > maxVariant; i--) {
		const excess = variantTotal - maxVariant;
		const reduceBy = Math.min(loadouts[i].memberCount, excess);
		loadouts[i].memberCount -= reduceBy;
		variantTotal -= reduceBy;
	}

	const trimmed = loadouts.filter((loadout, i) => i === 0 || loadout.memberCount > 0);
	trimmed[0].memberCount = squad.memberCount - variantTotal;
	return trimmed;
}

/** Converts an old-shape squad (weapons mixed into profile.equipment, no loadouts)
 *  into the current shape with weapons split into a single standard loadout. */
export function normalizeSquad(squad: Squad): Squad {
	if (Array.isArray(squad.loadouts)) return squad;

	const equipment = squad.profile.equipment;
	const weapons = equipment.filter((item) => item.kind === 'weapon' || item.kind === 'customWeapon');
	const rest = equipment.filter((item) => item.kind !== 'weapon' && item.kind !== 'customWeapon');

	return {
		...squad,
		profile: { ...squad.profile, equipment: rest },
		loadouts: [{ id: generateId(), memberCount: squad.memberCount, weapons }]
	};
}
