# Google Apps Script backend

The RSVP form posts to a Google Apps Script web app. Replace the code in your web
app with `Code.gs` from this folder to enable email notifications and guest
confirmations.

## Deployment steps

1. Open the Apps Script project that backs the published web app for the RSVP
   form.
2. Replace the contents of `Code.gs` with the code in this folder.
3. (Optional) Store the following script properties if you want to override the
   defaults:
   - `RSVP_SHEET_ID` — spreadsheet ID used to store submissions. Leave blank to
     skip persistence.
   - `RSVP_SHEET_NAME` — sheet name inside the spreadsheet (defaults to
     `RSVP Responses`).
   - `RSVP_FROM_NAME` — display name used when sending emails (defaults to
     `RSVP Egon & Ele`).
   - `RSVP_TIMEZONE` — timezone for timestamps (defaults to the Apps Script
     project timezone or `Europe/Rome`).
4. Make sure the deployed version has `Execution API`/`app` permissions to send
   mail on behalf of the script owner (the default when the owner deploys the
   web app).
5. Redeploy the web app (Publish → Deploy as web app) so the latest version is
   live.

## Behaviour

- Saves submissions to the configured sheet (if `RSVP_SHEET_ID` is set).
- Emails `egon.ferri@gmail.com` and `eleonora.tempesta96@gmail.com` whenever a
  new RSVP is received.
- Sends a confirmation email to the guest that includes a summary of their
  answers and key event details.
- Rejects invalid invite codes using the same MD5 hash check performed on the
  client.
