export type NavigationProps = {
  className?: string;
  id?: string;
};

export type LinkModel = {
  childrenLinks: NavigationLinkModel[];
  link: NavigationLinkModel;
  id?: number;
};

export type NavigationLinkModel = {
  accessibilityLabel: string;
  clickUrl: string;
  openInNewTab: boolean;
  title: string;
  id?: number;
  childrenLinks?: NavigationLinkModel[];
};
