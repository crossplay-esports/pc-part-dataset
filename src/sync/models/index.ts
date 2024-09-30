import Cpu from "./cpu";
import Videocard from "./video-card";

const ALL_MODELS: Record<string, any> = {
    'cpu': Cpu,
	// 'cpu-cooler',
	// 'motherboard',
	// 'memory',
	// 'internal-hard-drive',
	'video-card': Videocard,
	// 'case',
	// 'power-supply',
	// 'os',
	// 'monitor',
	// 'sound-card',
	// 'wired-network-card',
	// 'wireless-network-card',
	// 'headphones',
	// 'keyboard',
	// 'mouse',
	// 'speakers',
	// 'webcam',
	// 'case-accessory',
	// 'case-fan',
	// 'fan-controller',
	// 'thermal-paste',
	// 'external-hard-drive',
	// 'optical-drive',
	// 'ups'
}

export const getModel = (category: string) => {
    const model = ALL_MODELS[category];
    if(!model) {
        throw 'invalid model';
    }
    return model;
}