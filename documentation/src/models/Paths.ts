export const deploymentUrls = {
	figaro: {
		webProd: 'https://app.figaro.conryclan.com/',
		webDev: 'https://dev.app.figaro.conryclan.com/',
		webLocalDev: 'https://10.1.8.108:8080/',
		appProd: 'figaro',
		appDev: 'figaro-dev',
	},
	community: {
		prod: 'https://figaro.conryclan.com/',
		dev: 'https://dev.figaro.conryclan.com/',
		devLocal: 'http://10.1.8.108:3000/',
		UserScriptsApi: 'https://figaro.conryclan.com/toolbox/userTasks/',

		repo: {
			main: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/main/',
			develop: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/develop/',
			local: 'http://10.1.8.108:3000/'
		}
	},

}

export function getEnvPaths(): IPaths {

	let retObj: IPaths = {} as IPaths;
	const hostname = typeof window !== 'undefined' ? window.location.hostname : 'figaro.conryclan.com';

	switch (hostname) {
		case 'figaro.conryclan.com':
			retObj = {
				appAndroid: deploymentUrls.figaro.appProd,
				appWeb: deploymentUrls.figaro.webProd,
				community: deploymentUrls.community.prod,
				repo: deploymentUrls.community.repo.main + 'script-library/',
				userScriptsApi: deploymentUrls.community.UserScriptsApi,
			};
			break;
		
		case 'dev.figaro.conryclan.com':
			retObj = {
				appAndroid: deploymentUrls.figaro.appProd,
				appWeb: deploymentUrls.figaro.webDev,
				community: deploymentUrls.community.dev,
				repo: deploymentUrls.community.repo.develop + 'script-library/',
				userScriptsApi: deploymentUrls.community.UserScriptsApi,
			};
			break;
		
		default:

			retObj = {
				appAndroid: deploymentUrls.figaro.appDev,
				appWeb: deploymentUrls.figaro.webLocalDev,
				community: deploymentUrls.community.devLocal,
				repo: deploymentUrls.community.repo.local,
				userScriptsApi: deploymentUrls.community.UserScriptsApi,
			};
		}

	return retObj;
	}

export interface IPaths {
	appAndroid: string;
	appWeb: string;
	community: string;
	repo: string;
	userScriptsApi: string;
}