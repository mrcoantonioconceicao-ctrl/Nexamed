export interface WifiPrinter {
  id: string;
  name: string;
  ip: string;
  port: string;
  protocol: 'RAW_9100' | 'IPP_631' | 'LPR_515';
  signal: string;
  mac: string;
  isDefault?: boolean;
  status: 'ONLINE' | 'OFFLINE';
  sector: string;
}

export interface LabelDefaults {
  defaultFormat: 'ENVELOPE_75x45' | 'CUP_50x30' | 'A4_SHEET';
  includeQrCode: boolean;
  includeWarnings: boolean;
  includeAllergies: boolean;
  autoPrintOnCheck: boolean;
}

export const INITIAL_WIFI_PRINTERS: WifiPrinter[] = [
  {
    id: 'printer-1',
    name: 'Zebra ZD220 Wi-Fi (Posto Enfermagem)',
    ip: '192.168.1.150',
    port: '9100',
    protocol: 'RAW_9100',
    signal: '96%',
    mac: 'A4:D1:8C:2E:11:05',
    isDefault: true,
    status: 'ONLINE',
    sector: 'Posto de Enfermagem Central'
  },
  {
    id: 'printer-2',
    name: 'Elgin L42PRO Wireless (Farmácia SRT)',
    ip: '192.168.1.155',
    port: '9100',
    protocol: 'RAW_9100',
    signal: '88%',
    mac: '00:1F:B5:43:89:A2',
    isDefault: false,
    status: 'ONLINE',
    sector: 'Farmácia Terapêutica'
  },
  {
    id: 'printer-3',
    name: 'Epson TM-T20III Wi-Fi (Almoxarifado)',
    ip: '192.168.1.160',
    port: '631',
    protocol: 'IPP_631',
    signal: '81%',
    mac: 'DC:A6:32:1B:90:77',
    isDefault: false,
    status: 'ONLINE',
    sector: 'Almoxarifado & Estoque'
  },
  {
    id: 'printer-4',
    name: 'Argox OS-214plus Wi-Fi (Ambulatório B)',
    ip: '192.168.1.165',
    port: '9100',
    protocol: 'RAW_9100',
    signal: '72%',
    mac: 'B8:27:EB:9A:41:2C',
    isDefault: false,
    status: 'OFFLINE',
    sector: 'Bloco Terapêutico B'
  }
];

export const INITIAL_LABEL_DEFAULTS: LabelDefaults = {
  defaultFormat: 'ENVELOPE_75x45',
  includeQrCode: true,
  includeWarnings: true,
  includeAllergies: true,
  autoPrintOnCheck: false
};

const STORAGE_KEY_PRINTERS = 'nexamed_wifi_prINTERS_v1';
const STORAGE_KEY_LABEL_DEFAULTS = 'nexamed_label_defaults_v1';

export function getSavedPrinters(): WifiPrinter[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PRINTERS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading saved printers:', e);
  }
  return INITIAL_WIFI_PRINTERS;
}

export function savePrintersToStorage(printers: WifiPrinter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRINTERS, JSON.stringify(printers));
  } catch (e) {
    console.error('Error saving printers:', e);
  }
}

export function getDefaultPrinter(): WifiPrinter {
  const printers = getSavedPrinters();
  const foundDefault = printers.find(p => p.isDefault);
  return foundDefault || printers[0] || INITIAL_WIFI_PRINTERS[0];
}

export function setDefaultPrinterInStorage(printerId: string): WifiPrinter[] {
  const printers = getSavedPrinters().map(p => ({
    ...p,
    isDefault: p.id === printerId
  }));
  savePrintersToStorage(printers);
  return printers;
}

export function getSavedLabelDefaults(): LabelDefaults {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LABEL_DEFAULTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading label defaults:', e);
  }
  return INITIAL_LABEL_DEFAULTS;
}

export function saveLabelDefaultsToStorage(defaults: LabelDefaults): void {
  try {
    localStorage.setItem(STORAGE_KEY_LABEL_DEFAULTS, JSON.stringify(defaults));
  } catch (e) {
    console.error('Error saving label defaults:', e);
  }
}
