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

export type Squad = {
	id: string;
	name: string;
	profile: CharacterProfile;
	memberCount: number;
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
