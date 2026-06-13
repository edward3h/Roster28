import { normalizeSquad, type Warband } from './types';

const STORAGE_KEY = 'planet28-warband';

function isWarband(data: unknown): data is Warband {
	if (!data || typeof data !== 'object') return false;
	const w = data as Record<string, unknown>;
	return typeof w.name === 'string' && typeof w.pointsBudget === 'number' && Array.isArray(w.entries);
}

function normalizeWarband(warband: Warband): Warband {
	return {
		...warband,
		entries: warband.entries.map((entry) =>
			entry.type === 'squad' ? { ...entry, data: normalizeSquad(entry.data) } : entry
		)
	};
}

export function loadWarband(): Warband | null {
	if (typeof localStorage === 'undefined') return null;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const data = JSON.parse(raw);
		return isWarband(data) ? normalizeWarband(data) : null;
	} catch {
		return null;
	}
}

export function saveWarband(warband: Warband): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(warband));
}

export function exportWarband(warband: Warband): void {
	const blob = new Blob([JSON.stringify(warband, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${warband.name || 'warband'}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export async function importWarband(file: File): Promise<Warband> {
	const text = await file.text();
	const data = JSON.parse(text);
	if (!isWarband(data)) {
		throw new Error('That file does not look like a Planet 28 warband.');
	}
	return normalizeWarband(data);
}
