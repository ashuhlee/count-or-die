const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
	packagerConfig: {
		asar: true,
		name: 'Count or Die',
		executableName: 'CountOrDie',
		icon: './resources/icons/icon'
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-zip',
			platforms: ['win32'],
			config: {
				icon: './resources/icons/win/icon@256.ico',
				setupIcon: './resources/icons/win/icon@256.ico',
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
				icon: './resources/icons/mac/icon.icns',
				iconSize: 130,
				authors: 'ashuhlee',
				background: './resources/dmg/dmg-bg.png',
				format: 'ULFO',
				window:
					{ size:
						{ width: 640, height: 480 }
					},
				contents: [
					{ x: 175, y: 202, type: 'file', path: './out/Count or Die-darwin-arm64/Count or Die.app' },
					{ x: 460, y: 200, type: 'link', path: '/Applications' }
			  ]
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
