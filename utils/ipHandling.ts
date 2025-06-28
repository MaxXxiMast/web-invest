export const setIpData = async () => {
  await fetch('/api/ipApi')
    .then((response) => response.json())
    .then((data) => {
      const options: Record<string, string> = {};
      options['timezone'] = data?.timezone ?? 'Unknown'; //Just Added the FallBack Here
      options['IP Address'] = data?.ip ?? 'Unknown';
      options['Country'] = data?.country_name ?? 'Unknown';
      options['region'] = data?.region ?? 'Unknown';
      options['City'] = data?.city ?? 'Unknown';
      options['isp'] = data?.org ?? 'Unknown';
      sessionStorage.setItem('ipData', JSON.stringify(options));
    })
    .catch((error) => console.log('>>>Error:', error));
};

export const getIpData = () => {
  return sessionStorage.getItem('ipData') ?? '';
};

export const deleteIpData = () => {
  sessionStorage.removeItem('ipData');
};
