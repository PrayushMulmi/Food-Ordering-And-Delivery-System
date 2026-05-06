export const sendEmail = async ({ to, subject, html }) => {
  console.log("Mock email sent:", { to, subject, html });
  return true;
};
