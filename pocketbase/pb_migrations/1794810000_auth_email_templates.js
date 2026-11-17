/// Points user confirmation and password emails at the KrossLedger site.
/// Copy this file into the server pb_migrations directory and restart PocketBase.
/// PocketBase mail settings (SMTP, sender name, sender address) must already be set.

const SITE = "https://www.krossledger.com";

const verificationTemplate = {
  subject: "Confirm your KrossLedger email",
  body: `<p><img src="${SITE}/email-logo.png" alt="KrossLedger" width="64" height="64"></p>
<p>Hello,</p>
<p>Confirm your email to finish creating your KrossLedger account.</p>
<p>
  <a class="btn" href="${SITE}/#/confirm-verification/{TOKEN}" target="_blank" rel="noopener">Confirm email</a>
</p>
<p><i>If you did not create this account, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  KrossLedger
</p>`,
};

const resetPasswordTemplate = {
  subject: "Change your KrossLedger password",
  body: `<p><img src="${SITE}/email-logo.png" alt="KrossLedger" width="64" height="64"></p>
<p>Hello,</p>
<p>Use the link below to choose a new password for your KrossLedger account.</p>
<p>
  <a class="btn" href="${SITE}/#/reset-password/{TOKEN}" target="_blank" rel="noopener">Change password</a>
</p>
<p><i>If you did not ask for this, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  KrossLedger
</p>`,
};

const defaultVerificationTemplate = {
  subject: "Verify your {APP_NAME} email",
  body: `<p>Hello,</p>
<p>Thank you for joining us at {APP_NAME}.</p>
<p>Click on the button below to verify your email address.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-verification/{TOKEN}" target="_blank" rel="noopener">Verify</a>
</p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`,
};

const defaultResetPasswordTemplate = {
  subject: "Reset your {APP_NAME} password",
  body: `<p>Hello,</p>
<p>Click on the button below to reset your password.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" target="_blank" rel="noopener">Reset password</a>
</p>
<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`,
};

migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  unmarshal({
    verificationTemplate,
    resetPasswordTemplate,
  }, users);
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  unmarshal({
    verificationTemplate: defaultVerificationTemplate,
    resetPasswordTemplate: defaultResetPasswordTemplate,
  }, users);
  app.save(users);
});
