export type BadgeComponentProps = {
  label: string;
  isListedBadge?: boolean;
  isNSEBadge?: boolean;
};

export const badgePriority = [
  { label: 'sell anytime', priority: 1, icon: 'icon-sell-anytime' },
  { label: 'filling fast', priority: 2, icon: 'icon-zap' },
  { label: 'repeat investors', priority: 3, icon: 'icon-cycle' },
  { label: 'highest returns rates', priority: 4, icon: 'icon-star-dark' },
  { label: 'shortest tenure', priority: 5, icon: 'icon-clock-circle' },
  { label: 'most popular', priority: 6, icon: 'icon-crown' },
  { label: 'hiked recently', priority: 7, icon: 'icon-graph-up' },
  { label: 'withdraw anytime', priority: 8, icon: 'icon-withdraw' },
  { label: 'no savings a/c', priority: 9, icon: 'icon-bank-cross' },
];

export const getVisibleBadges = (labels: string[], isSlice = true) => {
  const filteredBadges = badgePriority.filter((badge) =>
    labels?.includes(badge?.label)
  );

  let priorityBadgeList = [...filteredBadges];
  priorityBadgeList.sort((a, b) => a?.priority - b?.priority);

  if (isSlice) {
    return priorityBadgeList?.slice(0, 2);
  }
  return priorityBadgeList;
};
