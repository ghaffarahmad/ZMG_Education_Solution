import type { Metadata } from "next";

export const SITE_URL = "https://zmgeducation.com";
export const SITE_NAME = "Z.M.G Education Solution";
export const LOGO_URL = `${SITE_URL}/logo.png`;
export const DEFAULT_OG_IMAGE = LOGO_URL;

export const DEFAULT_KEYWORDS = [
  "ZMG Education",
  "ZMG Education Solution",
  "ZMG Education Karachi",
  "student portal Karachi",
  "admit card access",
  "enrollment card access",
  "Ziauddin Board support",
  "Karachi Board support",
  "AIOU admission support",
  "board document support Karachi",
];

export const pageSeo = {
  home: {
    path: "/",
    title: "Z.M.G Education Solution | Student Portal & Board Support Karachi",
    description:
      "Z.M.G Education Solution provides student portal access, admission support, enrollment card access, admit card updates, fee record support, and board document assistance for Karachi Board, Ziauddin Board, and AIOU students.",
  },
  about: {
    path: "/about",
    title: "About Z.M.G Education Solution | Student Support Office Karachi",
    description:
      "Learn about Z.M.G Education Solution, a Karachi student support office helping students and parents with board services, admission guidance, and secure document access.",
  },
  services: {
    path: "/services",
    title: "Student Portal, Admit Card & Enrollment Card Services | Z.M.G Education",
    description:
      "Explore Z.M.G Education services for student portal access, admit card access, enrollment card access, fee record support, and board document assistance in Karachi.",
  },
  admissionSupport: {
    path: "/admission-support",
    title: "Admission Support for Karachi Board, Ziauddin Board & AIOU | Z.M.G",
    description:
      "Get admission support for Karachi Board, Ziauddin Board, and AIOU programs, including form guidance, student record review, and board document support.",
  },
  notices: {
    path: "/notices",
    title: "Latest Student Notices & Updates | Z.M.G Education Solution",
    description:
      "Read the latest Z.M.G Education student notices, admit card updates, enrollment card updates, fee announcements, and board support alerts.",
  },
  contact: {
    path: "/contact",
    title: "Contact Z.M.G Education Solution Karachi | Student Support Office",
    description:
      "Contact Z.M.G Education Solution in Karachi for admission support, board services, student portal help, admit cards, enrollment cards, and fee record assistance.",
  },
  studentPortal: {
    path: "/student-portal",
    title: "Z.M.G Student Portal | Secure Student Record & Document Access",
    description:
      "Use the secure Z.M.G Student Portal to verify student records, check fee status, access notices, and download available enrollment or admit cards.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Z.M.G Education Solution",
    description: "Read our Privacy Policy to learn how Z.M.G Education Solution securely handles, encrypts, and protects your personal and educational data.",
  },
  terms: {
    path: "/terms",
    title: "Terms of Service | Z.M.G Education Solution",
    description: "Review our Terms of Service regarding the use of the Z.M.G Education Solution website, Student Portal, and document services.",
  },
} as const;

export const publicSitemapPaths = [
  pageSeo.home.path,
  pageSeo.about.path,
  pageSeo.services.path,
  pageSeo.admissionSupport.path,
  pageSeo.notices.path,
  pageSeo.contact.path,
  pageSeo.studentPortal.path,
  pageSeo.privacy.path,
  pageSeo.terms.path,
] as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function resolveImageUrl(image?: string) {
  if (!image) return DEFAULT_OG_IMAGE;
  return absoluteUrl(image);
}

export function createSeoMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = resolveImageUrl(image);

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_PK",
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function createNoIndexMetadata(title: string): Metadata {
  const description = "Private Z.M.G Education Solution management area.";

  return {
    title,
    description,
    alternates: {},
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/admin`,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  url: SITE_URL,
  telephone: "+923143061669",
  email: "info@zmgeducation.com",
  image: LOGO_URL,
  logo: LOGO_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Shop #06 Near Sevri Baba Mazaar, Ahmed Market",
    addressLocality: "Karachi",
    addressRegion: "Sindh",
    addressCountry: "PK",
  },
  areaServed: {
    "@type": "City",
    name: "Karachi, Pakistan",
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export function jsonLdScriptProps(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
