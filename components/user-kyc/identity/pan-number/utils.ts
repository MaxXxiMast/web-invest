export const panHintsNumberData = [
  'Ensure the PAN number is exactly 10 characters long',
  'The PAN number format is five letters, four digits, and one letter (e.g., ABCDE1234F).',
];

export const infoForAutoFetchPan = `The PAN number linked with the registered mobile number is fetched from Credit Bureaus. Your data is protected and encrypted in accordance with all regulatory and privacy regulations`;

export const isNomineeNameValid = (name: string): boolean => {
  // Check if the name is not empty and contains only valid characters
  const nameRegex = /^[a-zA-Z\s]+$/;
  return name && nameRegex.test(name.trim());
};
