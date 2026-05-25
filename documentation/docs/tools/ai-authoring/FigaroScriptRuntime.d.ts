export { };

declare global {
	function sendCat(command: string, waitForResponse?: boolean): Promise<string>;

	type iconTypes = 'play-pause' | 'play' | 'pause' | 'stop';
	function pause(
		icon?: iconTypes='play-pause',
		colour?: string,
		resume?: Promise<void>
	): Promise<void>;

	function print(text?: string): void;

	function setTitle(title: string): void;

	function setDescription(title: string): void;

	interface ITaskRuntime {
		waitUntil(promise: Promise<any>): void;
		onCleanup(handler: (...args: any[]) => any): void;
		setInterval(handler: (...args: any[]) => any, timeout: number, ...args: any[]): number;
		clearInterval(intervalId: number): void;
		setTimeout(handler: (...args: any[]) => any, timeout: number, ...args: any[]): number;
		clearTimeout(timeoutId: number): void;
	}

	const task: ITaskRuntime;

	interface IStorageRuntime {
		get(key: string): string;
		set(key: string, value: any): void;
	}

	const Storage: IStorageRuntime;

	interface ITaskContext {
		task: {
			id: number;
			title: string;
			description: string;
			color?: string;
			autoRunOnConnect: boolean;
			autoRunPriority: number;
			autoLock: boolean;
		}
	}

	const context: ITaskContext;
}