const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
	packagerConfig: {
		asar: true,
		name: 'Count or Die',
		executableName: 'CountOrDie',
		icon: './src/renderer/assets/icons/icon'
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-zip',
			platforms: ['win32'],
			config: {
				icon: './src/renderer/assets/icons/win/icon@256.ico',
				setupIcon: './src/renderer/assets/icons/win/icon@256.ico',
				name: 'CountOrDie',
				authors: 'ashuhlee',
				description: 'Counter Game',
				noMsi: true
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin', 'win32'],
		},
		{
			name: '@electron-forge/maker-dmg',
			platforms: ['darwin'],
			config: {
				icon: './src/renderer/assets/icons/mac/icon.icns',
				name: 'Count or Die',
				background: undefined
			},
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		{
			name: '@electron-forge/plugin-vite',
			config: {
				build: [
					{
						entry: 'src/main/main.js',
						config: 'vite.main.config.js',
						target: 'main'
					},
					{
						entry: 'src/preload/preload.js',
						config: 'vite.main.config.js',
						target: 'preload'
					}
				],
				renderer: [
					{
						name: 'main_window',
						config: 'vite.renderer.config.js',
						html: 'src/renderer/index.html'
					}
				]
			}
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
