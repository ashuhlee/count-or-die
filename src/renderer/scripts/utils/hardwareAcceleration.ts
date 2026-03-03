
export function checkHardwareAcceleration(): boolean {
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

	if (!gl) return false;

	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
	if (debugInfo) {
		const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		if (renderer.includes('SwiftShader') || renderer.includes('Software')) {
			return false;
		}
	}
	return true;
}