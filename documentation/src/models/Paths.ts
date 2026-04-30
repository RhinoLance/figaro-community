export const deploymentUrls = {
	figaro: {
		webProd: 'https://app.figaro.conryclan.com/',
		webDev: 'https://dev.app.figaro.conryclan.com/',
		webLocalDev: 'http://10.1.8.108:8080/',
		appProd: 'figaro',
		appDev: 'figaro-dev',
		
	},
	community: {
		prod: 'https://community.figaro.conryclan.com/',
		dev: 'https://dev.community.figaro.conryclan.com/',
		devLocal: 'http://10.1.8.108:3000/',

		repo: {
			main: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/main/',
			develop: 'https://raw.githubusercontent.com/RhinoLance/figaro-community/refs/heads/develop/',
			local: 'http://10.1.8.108:3000/'
		}
	},
	
}
	
export function getEnvPaths() {
	if (typeof window !== 'undefined' && 
		window.location.port === '3000') {

		return {
			appAndroid: deploymentUrls.figaro.appDev,
			appWeb: deploymentUrls.figaro.webDev,
			community: deploymentUrls.community.devLocal,
			repo: deploymentUrls.community.repo.local,
		};
	}

	return {
		appAndroid: deploymentUrls.figaro.appProd,
		appWeb: deploymentUrls.figaro.webProd,
		community: deploymentUrls.community.prod,
		repo: deploymentUrls.community.repo.main + '/script-library/',
	};
}
