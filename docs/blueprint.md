# **App Name**: AutoNomad

## Core Features:

- Browse Cars: Browse a list of available cars with filtering and sorting options.
- Car Details: View detailed information about a specific car, including images, features, and rental terms.
- Location Search: Search for rental locations by city, address, or zip code.
- Booking: Create new and manage existing booking for car rentals.
- Smart recommendations: AI-powered tool to make recommendations based on user specified constraints.
 - Driver Management: Add, edit and manage drivers, including verification documents and availability.
 - Notifications: In-app notification center, plus optional email/SMS delivery for important events (booking requests, status updates).

## Style Guidelines:

- Primary color: The design incorporates a fiery orange (#FE3600), echoing the original user's intention, to give a vibrant feel and contrast with darker backgrounds.
- Background color: A deep, dark gray (#151515) creates a sophisticated and modern backdrop, allowing the bright primary color to pop.
- Accent color: Crisp white (#FFFFFF) serves as a contrasting accent for text and interactive elements, ensuring readability and clarity.
- Body and headline font: 'Inter' (sans-serif) provides a modern and neutral look for both headlines and body text, ensuring readability and a clean aesthetic.
- Simple, outlined icons related to car features and rental information.
- Clean and spacious layout with a focus on ease of navigation.
- Subtle transitions and animations on hover and click events to enhance user experience.

## Backend & Notifications

- Firestore collections: `users`, `cars`, `bookings`, `notifications`, `drivers`, `reviews`.
- Notifications are stored in `notifications/{notificationId}` with fields for `userId`, `title`, `message`, `type`, `channel`, `email`, `phone`, `read`, `processed`, `processedAt`, and `deliveryResults`.
- A Cloud Function (`onNotificationCreate`) listens for newly created notification documents and attempts delivery via configured providers (SendGrid for email, Twilio for SMS). Delivery results are written back to the notification document.
- The app also provides an API route and UI to trigger sending and to view notification history. The in-app Notifications Center shows unread counts and allows marking read/unread.

## Developer notes

- Environment variables (or functions config) are used for provider credentials:
	- SENDGRID_API_KEY, SENDGRID_FROM
	- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
- Functions are scaffolded under `/functions` and can be deployed via the Firebase CLI.
- The notification sender is designed to be tolerant when providers are not configured (it will record attempts and mark processed=false with details), which makes local development safe.

## Deploying the Cloud Function and testing

1) Set provider credentials in Firebase Functions config (recommended). Example:

\`\`\`bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" sendgrid.from="no-reply@yourdomain.com"
firebase functions:config:set twilio.sid="YOUR_TWILIO_SID" twilio.token="YOUR_TWILIO_TOKEN" twilio.from="+1234567890"
\`\`\`

2) Install and build functions, then deploy:

\`\`\`bash
cd functions
npm install
npm run build
firebase deploy --only functions
\`\`\`

3) (Optional) Run locally against Firestore using Application Default Credentials or the Firebase emulator. To quickly test the end-to-end flow, use the included helper script to create a test notification:

\`\`\`bash
# from repository root
cd functions
# ensure firebase-admin can authenticate (ADC or service account via GOOGLE_APPLICATION_CREDENTIALS)
node tools/createTestNotification.js --userId="<UID>" --title="Test booking" --message="This is a test"
\`\`\`

4) The Cloud Function `onNotificationCreate` will trigger for new docs in `notifications/` and attempt delivery. Check the notification document for `processed`, `processedAt`, and `deliveryResults` fields to confirm results.

Notes:
- If you'd rather use environment variables, set `SENDGRID_API_KEY`, `SENDGRID_FROM`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` before deploying. The function prefers `functions.config()` (deployed config) but will fall back to process env values.
- When running in the Cloud Functions runtime, `functions.config()` values are accessible; locally, use `firebase functions:config:get` or `firebase emulators:start --only functions` and set local env accordingly.
