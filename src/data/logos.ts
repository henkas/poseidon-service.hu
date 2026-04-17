const BRANDFETCH_CLIENT_ID = "1idKqX_mjt3_lN3ROtG";
const BRANDFETCH_CDN = "https://cdn.brandfetch.io";

export type BrandLogo = {
  name: string;
  src: string;
  width?: number;
  height?: number;
};

export const clientLogos: BrandLogo[] = [
  {
    name: "Medicover",
    src: `${BRANDFETCH_CDN}/medicover.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Strabag",
    src: `${BRANDFETCH_CDN}/strabag.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "DHL",
    src: `${BRANDFETCH_CDN}/dhl.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "McDonald's",
    src: `${BRANDFETCH_CDN}/mcdonalds.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Thyssenkrupp",
    src: `${BRANDFETCH_CDN}/thyssenkrupp.com/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Axiál",
    src: `${BRANDFETCH_CDN}/axial.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Eurings",
    src: `${BRANDFETCH_CDN}/eurings.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  },
  {
    name: "Novochem",
    src: `${BRANDFETCH_CDN}/novochem.hu/w/512/h/512/logo?c=${BRANDFETCH_CLIENT_ID}`,
    width: 512,
    height: 512
  }
];
