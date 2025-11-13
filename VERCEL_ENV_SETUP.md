# Environment Variables dla Vercel

Musisz ustawić następujące zmienne środowiskowe w Vercel Dashboard:

## Google Sheets (WYMAGANE)

### `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`
**Typ:** JSON string
**Opis:** Credentials dla Google Service Account (całość jako string JSON)
**Przykład:**
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### `GOOGLE_SHEET_ID`
**Typ:** String
**Opis:** ID arkusza Google Sheets (z URL)
**Przykład:** `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

## Webhooks (OPCJONALNE)

### Make.com (Social Media)

#### `MAKE_WEBHOOK_URL`
**Typ:** URL
**Opis:** URL webhooka Make.com dla publikacji w social media
**Przykład:** `https://hook.eu1.make.com/xxxxxxxxxxxxx`

### WordPress

#### `WORDPRESS_WEBHOOK_URL`
**Typ:** URL
**Opis:** URL webhooka WordPress
**Przykład:** `https://twoja-strona.pl/wp-json/custom/v1/publish`

#### `WORDPRESS_WEBHOOK_USERNAME`
**Typ:** String
**Opis:** Username do Basic Auth dla WordPress webhook

#### `WORDPRESS_WEBHOOK_PASSWORD`
**Typ:** String
**Opis:** Password do Basic Auth dla WordPress webhook

---

## Jak dodać zmienne w Vercel:

1. Wejdź na https://vercel.com/dashboard
2. Wybierz swój projekt
3. Przejdź do **Settings** → **Environment Variables**
4. Dodaj każdą zmienną osobno:
   - Name: nazwa zmiennej (np. `GOOGLE_SHEET_ID`)
   - Value: wartość
   - Environments: zaznacz **Production**, **Preview**, **Development**
5. Kliknij **Save**

---

## Testowanie

Po dodaniu zmiennych, **Redeploy** projekt w Vercel:
- Dashboard → Deployments → Redeploy
