type ImageFormat = {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
};

type StrapiImageData = {
  id: number;
  attributes: {
    name: string;
    alternativeText: string;
    caption: string;
    width: number;
    height: number;
    formats: {
      small?: ImageFormat;
      thumbnail?: ImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: any | null;
    createdAt: string;
    updatedAt: string;
  };
};

type ProfileImage = {
  data: StrapiImageData;
};

type SocialMediaImage = {
  data: StrapiImageData;
};

export type TestimonialCard = {
  id: number;
  name: string;
  subTitle: string;
  content: string;
  footerText: string | null;
  socialMediaUrl: string;
  profileImage: ProfileImage;
  socialMediaImage: SocialMediaImage;
};
