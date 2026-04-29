export const deploymentUrls = {
	figaro: {
		prod: 'https://app.figaro.conryclan.com/',
		dev: 'https://dev.app.figaro.conryclan.com/',
		devLocal: 'http://localhost:8080/',
		appProc: 'figaro',
		appDev: 'figaro-dev',
		
	},
	community: {
		prod: 'https://community.figaro.conryclan.com/',
		dev: 'https://dev.community.figaro.conryclan.com/',
		devLocal: 'http://localhost:3000/',

		repo: {
			main: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/main/',
			develop: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/develop/',
			local: 'http://localhost:3000/'
		}
	},
	
}
	
export function getEnvPaths() {
	if (typeof window !== 'undefined' && 
		window.location.origin === 
		deploymentUrls.community.devLocal.replace(/\/$/, '')) {

		return {
			figaro: deploymentUrls.figaro.devLocal,
			community: deploymentUrls.community.devLocal,
			repo: deploymentUrls.community.repo.local,
			app: deploymentUrls.community.dev
		};
	}

	return {
		figaro: deploymentUrls.figaro.prod,
		community: deploymentUrls.community.prod,
		repo: deploymentUrls.community.repo.main + '/script-library/',
		app: deploymentUrls.community.prod
	};
}
