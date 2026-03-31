export type Locale = "hu" | "en";

type Service = {
  title: string;
  description: string;
};

type PriceRow = {
  service: string;
  price: string;
};

type ReferenceGroup = {
  title: string;
  items: string[];
};

type ContactPerson = {
  name: string;
  role: string;
  phone: string;
};

export type LocaleContent = {
  lang: string;
  title: string;
  description: string;
  nav: Array<{ href: string; label: string }>;
  languageLabel: string;
  languageSwitch: Array<{ href: string; label: string; active: boolean }>;
  themeToggle: {
    label: string;
    light: string;
    dark: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ value: string; label: string }>;
  };
  heroImages: {
    main: { src: string; alt: string };
    side: Array<{ src: string; alt: string }>;
  };
  trustStrip: {
    kicker: string;
    items: string[];
  };
  about: {
    kicker: string;
    title: string;
    intro: string;
    cards: Array<{ title: string; text: string }>;
  };
  services: {
    kicker: string;
    title: string;
    intro: string;
    items: Service[];
  };
  pricing: {
    kicker: string;
    title: string;
    note: string;
    serviceHeader: string;
    priceHeader: string;
    rows: PriceRow[];
  };
  references: {
    kicker: string;
    title: string;
    intro: string;
    groups: ReferenceGroup[];
  };
  partnerCompany: {
    kicker: string;
    title: string;
    intro: string;
    name: string;
    href: string;
    cta: string;
  };
  contact: {
    kicker: string;
    title: string;
    intro: string;
    addressLabel: string;
    address: string;
    officeNote: string;
    emailLabel: string;
    socialLabel: string;
    socialText: string;
    people: ContactPerson[];
    formTitle: string;
    formIntro: string;
    formLabels: {
      name: string;
      company: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
    };
    mailtoSubject: string;
    mailBodyLabels: {
      name: string;
      company: string;
      email: string;
      phone: string;
      message: string;
    };
  };
  footer: string;
};

const sharedReferences = {
  ongoing: [
    "Medicover klinika",
    "Eurings Zrt.",
    "Techszerviz Kft.",
    "Strabag Zrt.",
    "Axiál Kft.",
    "Novochem Kft.",
    "DHL Express Logisztikai Központ",
    "Laguna Lux Fürdőszoba Szalon",
    "Skála ruházati áruház",
    "Mitor Kft.",
    "Loxon Solutions Zrt.",
    "McDonald's éttermek"
  ],
  flooring: [
    "Diósgyőri kórház",
    "Egyházi rendezvénycsarnok",
    "Eurings Zrt. Szerszámregeneráló üzem"
  ]
};

export const siteContent: Record<Locale, LocaleContent> = {
  hu: {
    lang: "hu",
    title: "Poseidon Service Kft. | Professzionális takarítás",
    description:
      "Professzionális takarítás ipari, irodai és egészségügyi környezetben, több mint 15 év tapasztalattal.",
    nav: [
      { href: "#rolunk", label: "Rólunk" },
      { href: "#szolgaltatasok", label: "Szolgáltatások" },
      { href: "#arak", label: "Áraink" },
      { href: "#referenciak", label: "Referenciák" },
      { href: "#kapcsolat", label: "Kapcsolat" }
    ],
    languageLabel: "Nyelv",
    languageSwitch: [
      { href: "/", label: "HU", active: true },
      { href: "/en/", label: "EN", active: false }
    ],
    themeToggle: {
      label: "Téma",
      light: "Világos",
      dark: "Sötét"
    },
    hero: {
      eyebrow: "Bízza ránk a piszkos munkát",
      title: "Megbízható takarítás vállalatoknak, létesítményeknek és intézményeknek.",
      subtitle:
        "Debreceni központtal, országos lefedettséggel végzünk napi takarítást, nagytakarítást, gépi padlóápolást és üvegfelület-tisztítást vállalati és intézményi környezetben.",
      primaryCta: "Ajánlatkérés",
      secondaryCta: "Szolgáltatásaink",
      stats: [
        { value: "15+ év", label: "iparági tapasztalat" },
        { value: "Országosan", label: "elérhető szolgáltatások" },
        { value: "24 órán belül", label: "válasz munkanapokon" }
      ]
    },
    heroImages: {
      main: { src: "/images/image11.jpg", alt: "Professzionális takarító munkában" },
      side: [
        { src: "/images/image05.jpg", alt: "Gépi padlótisztítás" },
        { src: "/images/image03.jpg", alt: "Nagy üvegfelületek tisztítása" }
      ]
    },
    trustStrip: {
      kicker: "Megbízóink köre",
      items: ["egészségügy", "ipari csarnokok", "logisztika", "irodaházak", "kereskedelem"]
    },
    about: {
      kicker: "Rólunk",
      title: "Tapasztalat, technológia és folyamatos ellenőrzés.",
      intro:
        "Nagyobb vállalati, intézményi és ipari telephelyek tisztaságát támogatjuk, a munkaszervezést mindig az üzemmenethez igazítva.",
      cards: [
        {
          title: "Kik vagyunk?",
          text: "Több mint másfél évtizede dolgozunk nagyobb vállalati és intézményi környezetben."
        },
        {
          title: "Mit csinálunk?",
          text: "Ipari, irodai, logisztikai és egészségügyi telephelyek napi és időszakos takarítását vállaljuk."
        },
        {
          title: "Miért minket válasszanak?",
          text: "Az ajánlatot, a technológiát és az ellenőrzést a megrendelő működéséhez igazítjuk."
        }
      ]
    },
    services: {
      kicker: "Szolgáltatások",
      title: "Komplex takarítási megoldások az egész ország területén.",
      intro:
        "A napi üzemeléstől a speciális feladatokig úgy szervezzük a munkát, hogy az illeszkedjen az adott telephely működéséhez.",
      items: [
        {
          title: "Általános nagytakarítás",
          description: "Felújítás, festés vagy egyéb munkálatok utáni komplett takarítás irodákban, csarnokokban és üzlethelyiségekben."
        },
        {
          title: "Gépi padlósúrolás",
          description: "Professzionális gépekkel végzett gépi súrolás és bevonatolás ipari és kereskedelmi területeken."
        },
        {
          title: "Folyamatos takarítás",
          description: "Saját személyzettel biztosított napi, heti vagy egyedi ütemezésű takarítás irodákban és telephelyeken."
        },
        {
          title: "Üvegfelületek tisztítása",
          description: "Ablakok és nagy üvegfelületek tisztítása állványzattal vagy kosaras emelővel is."
        },
        {
          title: "Padlózat bevonatolása",
          description: "Alaptisztítás és tartós felületvédelem a nagy igénybevételű padlófelületek hosszabb élettartamáért."
        },
        {
          title: "Üzemeltetés",
          description: "Telephelyek és létesítmények üzemeltetési feladatai egyedi egyeztetés alapján."
        }
      ]
    },
    pricing: {
      kicker: "Áraink",
      title: "Átlátható irányárak, pontos ajánlat személyes felmérés után.",
      note: "Személyes felmérés és részletes ajánlat kéréséhez keressen minket telefonon vagy emailben.",
      serviceHeader: "Szolgáltatás",
      priceHeader: "Ár",
      rows: [
        { service: "Általános nagytakarítás", price: "300 – 1 000 Ft / m²" },
        { service: "Gépi padlósúrolás", price: "100 Ft / m²-től" },
        { service: "Folyamatos takarítás", price: "10 – 100 Ft / m² / nap" },
        { service: "Üvegfelületek tisztítása", price: "80 – 200 Ft / m² / nap" },
        { service: "Padlózat bevonatolása", price: "Egyedi megbeszélés alapján" },
        { service: "Üzemeltetés", price: "Egyedi megbeszélés alapján" }
      ]
    },
    references: {
      kicker: "Referenciák",
      title: "Megbízóink között egészségügyi, ipari, logisztikai és kereskedelmi szereplők is megtalálhatók.",
      intro: "A folyamatos együttműködés és a visszatérő megbízások adják munkánk legerősebb igazolását.",
      groups: [
        {
          title: "Folyamatos takarítás és időszakos munkák",
          items: sharedReferences.ongoing
        },
        {
          title: "Gépi padlósúrolás és bevonatolás",
          items: sharedReferences.flooring
        }
      ]
    },
    partnerCompany: {
      kicker: "Kapcsolódó márka",
      title: "TOP-CLEAN 87' Kft.",
      intro:
        "A TOP-CLEAN 87' Kft. különálló partnerbrandként támogatja a nagyobb vállalati és intézményi projekteket.",
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: "TOP-CLEAN oldal megnyitása"
    },
    contact: {
      kicker: "Kapcsolat",
      title: "Kérjen felmérést vagy ajánlatot közvetlenül a vezetőségtől.",
      intro: "Munkanapokon jellemzően 24 órán belül válaszolunk minden megkeresésre.",
      addressLabel: "Cím",
      address: "4031 Debrecen, Derék utca 128.",
      officeNote: "Személyes ügyfélfogadás nincs.",
      emailLabel: "Email",
      socialLabel: "Közösségi média",
      socialText: "Facebook oldalunk",
      people: [
        { name: "Papp Sándor", role: "ügyvezető", phone: "+36 20 955 2464" },
        { name: "Szoboszlai Gábor", role: "ügyvezető", phone: "+36 30 946 0693" }
      ],
      formTitle: "Gyors ajánlatkérés",
      formIntro: "Az űrlap elküldése megnyit egy előkészített emailt az alapadataival.",
      formLabels: {
        name: "Név",
        company: "Cég",
        email: "Email",
        phone: "Telefon",
        message: "Feladat rövid leírása",
        submit: "Email megnyitása"
      },
      mailtoSubject: "Ajánlatkérés - Poseidon Service",
      mailBodyLabels: {
        name: "Név",
        company: "Cég",
        email: "Email",
        phone: "Telefon",
        message: "Üzenet"
      }
    },
    footer: "© Poseidon Service Kft. Minden jog fenntartva."
  },
  en: {
    lang: "en",
    title: "Poseidon Service Kft. | Professional cleaning services",
    description:
      "Professional cleaning for industrial, office, retail and healthcare environments with more than 15 years of experience.",
    nav: [
      { href: "#about", label: "About" },
      { href: "#services", label: "Services" },
      { href: "#pricing", label: "Pricing" },
      { href: "#references", label: "References" },
      { href: "#contact", label: "Contact" }
    ],
    languageLabel: "Language",
    languageSwitch: [
      { href: "/", label: "HU", active: false },
      { href: "/en/", label: "EN", active: true }
    ],
    themeToggle: {
      label: "Theme",
      light: "Light",
      dark: "Dark"
    },
    hero: {
      eyebrow: "Leave the dirty work to us",
      title: "Dependable cleaning for industrial, office, healthcare and facility operators.",
      subtitle:
        "Based in Debrecen and working nationwide, we provide recurring cleaning, deep cleaning, machine floor scrubbing and glass surface cleaning for larger business and institutional sites.",
      primaryCta: "Request a quote",
      secondaryCta: "View services",
      stats: [
        { value: "15+ years", label: "of industry experience" },
        { value: "Nationwide", label: "service availability" },
        { value: "Within 24h", label: "weekday response time" }
      ]
    },
    heroImages: {
      main: { src: "/images/image11.jpg", alt: "Professional cleaner at work" },
      side: [
        { src: "/images/image05.jpg", alt: "Floor cleaning machine in use" },
        { src: "/images/image03.jpg", alt: "Cleaning large windows" }
      ]
    },
    trustStrip: {
      kicker: "Trusted by",
      items: ["healthcare", "industrial halls", "logistics", "office buildings", "retail"]
    },
    about: {
      kicker: "About",
      title: "Experience, modern methods and consistent quality control.",
      intro:
        "We support the cleanliness of larger company, institutional and industrial sites, tailoring the work schedule to the operation.",
      cards: [
        {
          title: "Who we are",
          text: "For more than 15 years we have worked in larger business and institutional environments."
        },
        {
          title: "What we do",
          text: "We handle recurring and one-off cleaning for industrial, office, logistics and healthcare sites."
        },
        {
          title: "Why choose us",
          text: "We tailor the proposal, technology and checks to the client's operation."
        }
      ]
    },
    services: {
      kicker: "Services",
      title: "Comprehensive cleaning solutions available across Hungary.",
      intro:
        "From daily routines to specialist tasks, our work is planned around the operational needs of each site.",
      items: [
        {
          title: "Deep cleaning",
          description: "Complete post-renovation and post-construction cleaning for offices, halls and commercial premises."
        },
        {
          title: "Machine floor scrubbing",
          description: "Professional machine scrubbing and floor coating for industrial and commercial surfaces."
        },
        {
          title: "Recurring cleaning",
          description: "Daily, weekly or custom-scheduled cleaning delivered by our own staff for offices and facilities."
        },
        {
          title: "Glass and window cleaning",
          description: "Cleaning of windows and larger glazed surfaces, including work with scaffolding or boom lifts."
        },
        {
          title: "Floor coating",
          description: "Base cleaning and durable protective coating to extend the life of high-traffic floors."
        },
        {
          title: "Facility operations support",
          description: "Operational support tasks for sites and buildings based on individually agreed requirements."
        }
      ]
    },
    pricing: {
      kicker: "Pricing",
      title: "Indicative pricing with tailored quotes after a site visit.",
      note: "Contact us by phone or email for a personal survey and a detailed quotation.",
      serviceHeader: "Service",
      priceHeader: "Price",
      rows: [
        { service: "Deep cleaning", price: "HUF 300 – 1,000 / m²" },
        { service: "Machine floor scrubbing", price: "From HUF 100 / m²" },
        { service: "Recurring cleaning", price: "HUF 10 – 100 / m² / day" },
        { service: "Glass surface cleaning", price: "HUF 80 – 200 / m² / day" },
        { service: "Floor coating", price: "Subject to individual requirements" },
        { service: "Facility operations support", price: "Subject to individual requirements" }
      ]
    },
    references: {
      kicker: "References",
      title: "Our client list includes healthcare, industrial, logistics and commercial organizations.",
      intro: "Long-term cooperation and repeat assignments remain the clearest proof of our service quality.",
      groups: [
        {
          title: "Recurring cleaning and periodic work",
          items: sharedReferences.ongoing
        },
        {
          title: "Machine floor scrubbing and floor coating",
          items: sharedReferences.flooring
        }
      ]
    },
    partnerCompany: {
      kicker: "Related brand",
      title: "TOP-CLEAN 87' Kft.",
      intro:
        "TOP-CLEAN 87' Kft. supports larger business and institutional projects as a separate partner brand.",
      name: "TOP-CLEAN 87' Kft.",
      href: "https://topclean87kft.hu/",
      cta: "Open TOP-CLEAN"
    },
    contact: {
      kicker: "Contact",
      title: "Request a survey or quotation directly from management.",
      intro: "We typically respond to all enquiries within 24 hours on business days.",
      addressLabel: "Address",
      address: "4031 Debrecen, Derék utca 128.",
      officeNote: "No in-person customer service.",
      emailLabel: "Email",
      socialLabel: "Social media",
      socialText: "Visit us on Facebook",
      people: [
        { name: "Sándor Papp", role: "Managing Director", phone: "+36 20 955 2464" },
        { name: "Gábor Szoboszlai", role: "Managing Director", phone: "+36 30 946 0693" }
      ],
      formTitle: "Quick quote request",
      formIntro: "Submitting the form opens a prepared email with your contact details.",
      formLabels: {
        name: "Name",
        company: "Company",
        email: "Email",
        phone: "Phone",
        message: "Brief description",
        submit: "Open email"
      },
      mailtoSubject: "Quote request - Poseidon Service",
      mailBodyLabels: {
        name: "Name",
        company: "Company",
        email: "Email",
        phone: "Phone",
        message: "Message"
      }
    },
    footer: "© Poseidon Service Kft. All rights reserved."
  }
};

export default siteContent;
