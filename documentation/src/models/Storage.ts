export class Storage {

	public static get(key: string): string | null {
		if (typeof window === 'undefined' || !window.localStorage) {
			return null;
		}
		return window.localStorage.getItem(key);
	}

	public static set(key: string, value: string): void {
		if (typeof window === 'undefined' || !window.localStorage) {
			return;
		}
		window.localStorage.setItem(key, value);
	}

}

export const StorageKeys = {
	UserCallsign: 'userCallsign'
}