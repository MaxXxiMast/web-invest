export const isPanVerifiedTimeCheck = (date,diff=30)=>{
  // Convert the given timestamp to a Date object
  const givenDate = new Date(date);
  // Get the current date and time
  const currentDate = new Date();
  // Calculate the difference in milliseconds
  const differenceInMilliseconds =
    currentDate.valueOf() - givenDate.valueOf();
  // Convert milliseconds to minutes
  const differenceInMinutes = Math.floor(
    differenceInMilliseconds / (1000 * 60)
  );
  return differenceInMinutes > diff;
}