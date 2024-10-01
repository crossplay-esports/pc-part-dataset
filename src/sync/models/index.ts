import Case from "./case";
import caseAccessory from "./case-accessory";
import caseFan from "./case-fan";
import Cpu from "./cpu";
import Cpucooler from "./cpu-cooler";
import Videocard from "./video-card";

const ALL_MODELS: Record<string, any> = {
    'cpu': Cpu,
	'cpu-cooler': Cpucooler,
	// 'motherboard',
	// 'memory',
	// 'internal-hard-drive',
	'video-card': Videocard,
	'case': Case,
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
	'case-accessory': caseAccessory,
	'case-fan': caseFan,
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