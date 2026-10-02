# ReviewFlow AI — Google Business Profile Setup & Integration Guide

This guide details how to configure Google Cloud Platform (GCP) and Google Business Profile APIs to authenticate ReviewFlow AI with official Google Business Profile accounts.

---

## 1. Create or Select a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your existing organization or create a new project named `ReviewFlow-AI-Production`.
3. Ensure billing is enabled for your project (required for API quotas and Google Cloud services).

---

## 2. Enable Google Business Profile APIs

ReviewFlow AI uses the modern, official Google Business Profile APIs. In the **APIs & Services > Library** section, enable the following:

1. **Google Business Profile Account Management API** (`mybusinessaccountmanagement.googleapis.com`):
   - Used for discovery of Google Business accounts and organization hierarchy.
2. **Google Business Profile Business Information API** (`mybusinessbusinessinformation.googleapis.com`):
   - Used to list and discover verified physical business locations and listing details.
3. **Google Business Profile API / My Business API v4** (`mybusiness.googleapis.com`):
   - Used to synchronize customer reviews and publish owner replies to Google reviews.
4. **Google Business Profile Performance API** (`businessprofileperformance.googleapis.com`):
   - Used for search impressions, calls, and direction requests.

*Note: Access to the Google Business Profile APIs requires your Google Cloud project to request Business Profile API access via the [Google Business Profile API Access Request Form](https://developers.google.com/my-business/content/prereqs#request-access).*

---

## 3. Configure OAuth Consent Screen

1. In the GCP Console, go to **APIs & Services > OAuth consent screen**.
2. Select **User Type**:
   - **External** (allows any Google account owning a verified business listing to connect).
3. Fill in the App details:
   - **App Name:** `ReviewFlow AI`
   - **User Support Email:** `support@reviewflowai.in`
   - **App Logo:** ReviewFlow AI brand mark
   - **Application Home Page:** `https://reviewflowai.in`
   - **Privacy Policy Link:** `https://reviewflowai.in/privacy`
   - **Terms of Service Link:** `https://reviewflowai.in/terms`
   - **Authorized Domains:** `reviewflowai.in` (and your deployed domain)
4. **Configure Scopes:**
   - Add scope: `https://www.googleapis.com/auth/business.manage` (Full access to manage business profile, listings, reviews, and replies).
   - Add basic profile scopes: `openid`, `email`, `profile`.

---

## 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Choose **Application type:** `Web application`.
4. Name: `ReviewFlow AI Web Client`.
5. **Authorized JavaScript origins:**
   - Development: `http://localhost:3000`
   - Production: `https://your-production-app.run.app`
6. **Authorized redirect URIs:**
   - Development: `http://localhost:3000/api/v1/integrations/google/callback`
   - Production: `https://your-production-app.run.app/api/v1/integrations/google/callback`
7. Click **Create** and copy your:
   - **Client ID**
   - **Client Secret**

---

## 5. Configure Environment Variables

Set the copied credentials in your environment configuration (or `.env` file):

```env
GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
GOOGLE_REDIRECT_URI="https://your-production-app.run.app/api/v1/integrations/google/callback"
APP_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

*CRITICAL:* Never commit real secrets or production credentials into git repository files.

---

## 6. Verification Requirements for Production

For production use with general Google users:
1. Submit your OAuth Consent Screen for **Google App Verification**.
2. Prepare a 60-second Loom or YouTube video demonstrating the OAuth consent screen, explaining how `https://www.googleapis.com/auth/business.manage` is used specifically to sync verified reviews and post business owner replies.
3. Ensure your Privacy Policy clearly explains that Google review data is securely stored for the user's business and never sold or shared with unauthorized parties.
