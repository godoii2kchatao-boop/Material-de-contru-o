/**
 * Stand-in photographs (Unsplash License). Served from the Unsplash CDN, as Unsplash asks,
 * and optimised by next/image. Replace with the client's own photos in /public when customising.
 */
export const PHOTO_IDS = {
  'obra-faiscas': '1504917595217-d4dc5ebe6122',
  'obra-vergalhao-aereo': '1504307651254-35680f356dfd',
  'obra-pilar-armacao': '1531834685032-c34bf0d84c77',
  'obra-laje-equipe': '1541888946425-d81bb19240f5',
  'obra-galpao-madeira': '1589939705384-5185137a7f0f',
  'furadeira-concreto': '1504148455328-c376907d081c',
  'revestimento-metro': '1523413651479-597eb2da0ad6',
  'hidraulica-tubos': '1607472586893-edb57bdc0e39',
  eletricista: '1621905251189-08b45d6a269e',
  engenheiros: '1626885930974-4b69aa21bbf9',
  'projeto-planta': '1503387762-592deb58ef4e',
  'sala-acabada': '1600607687939-ce8a6c25118c',
  'sala-acabada-2': '1600585152915-d208bec867a1',
  deposito: '1586528116311-ad8dd3c8310d',
  'estrutura-predio': '1508450859948-4e04fabaa4ea',
  guindaste: '1429497419816-9ca5cfb4571a',
  'madeira-estrutura': '1587582423116-ec07293f0395',
  'reforma-sala': '1517581177682-a085bb7ffb15',
} as const;

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?auto=format&fit=crop&w=2400&q=80`;
}
