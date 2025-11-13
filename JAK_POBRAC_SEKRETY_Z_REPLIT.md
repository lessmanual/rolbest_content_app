# Jak pobrać sekrety z Replit

## Krok 1: Otwórz Replit Secrets

1. Wejdź na swój projekt w Replit
2. Kliknij ikonę **zamka** 🔒 w lewym menu (Secrets)
3. Zobaczysz listę wszystkich sekretów

## Krok 2: Znajdź i skopiuj zmienne

Skopiuj wartości następujących zmiennych (jeśli istnieją):

### WYMAGANE:
- ✅ `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` - cały JSON (długi string)
- ✅ `GOOGLE_SHEET_ID` - ID arkusza

### OPCJONALNE:
- `MAKE_WEBHOOK_URL`
- `WORDPRESS_WEBHOOK_URL`
- `WORDPRESS_WEBHOOK_USERNAME`
- `WORDPRESS_WEBHOOK_PASSWORD`

## Krok 3: Gdzie wkleić?

### Opcja A: Lokalnie (testowanie)
1. Skopiuj plik `.env.template` jako `.env.local`
2. Wypełnij wartościami z Replit
3. Testuj lokalnie

### Opcja B: Vercel (deployment)
1. Otwórz plik `VERCEL_ENV_QUICK_COPY.txt`
2. Wypełnij wartościami z Replit
3. Wejdź na Vercel Dashboard
4. Settings → Environment Variables
5. Dodaj każdą zmienną osobno

## Gotowe!

Po dodaniu zmiennych w Vercel, kliknij **Redeploy** w zakładce Deployments.
