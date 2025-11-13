# 🚀 JAK WRZUCIĆ NA VERCEL - KROK PO KROKU

## Krok 1: Zainstaluj nową zależność

```bash
npm install
```

## Krok 2: Wrzuć na Vercel

### Opcja A: Przez CLI (szybkie)

```bash
npm install -g vercel
vercel
```

Vercel zapyta o kilka rzeczy - wszędzie Enter (domyślne ustawienia są ok).

### Opcja B: Przez Dashboard (polecam)

1. Wejdź na https://vercel.com
2. Kliknij **Add New** → **Project**
3. **Import Git Repository** lub **Upload folder**
4. Wybierz ten folder z projektem
5. Vercel automatycznie wykryje konfigurację
6. **NIE KLIKAJ jeszcze Deploy!** Najpierw dodaj zmienne środowiskowe ↓

## Krok 3: Dodaj zmienne środowiskowe

**WAŻNE:** Zrób to PRZED pierwszym deploymentem!

1. W Vercel Dashboard → Settings → **Environment Variables**
2. Otwórz plik **`.env.vercel`** (jest w folderze projektu)
3. Dodaj każdą zmienną osobno:

### Zmienna 1:
```
Name: GOOGLE_SHEET_ID
Value: 1N30KXaLUmf-oNEXjrwdV5l05WRNXEQIZhr0MEqP0uRY
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Zmienna 2:
```
Name: MAKE_WEBHOOK_URL
Value: https://hook.eu2.make.com/mnb7tikm23i9ra049fclml6yg7iixfi1
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Zmienna 3 (WAŻNA - długa):
```
Name: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
Value: [SKOPIUJ CAŁĄ LINIĘ z .env.vercel - od { do } włącznie]
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Zmienna 4:
```
Name: WORDPRESS_WEBHOOK_URL
Value: https://rolbest.app.n8n.cloud/webhook/9f2d3220-a48d-4fae-864a-5ca2b15a3199
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Zmienna 5:
```
Name: WORDPRESS_WEBHOOK_USERNAME
Value: rolbest
Environments: ☑ Production  ☑ Preview  ☑ Development
```

### Zmienna 6:
```
Name: WORDPRESS_WEBHOOK_PASSWORD
Value: rolbest
Environments: ☑ Production  ☑ Preview  ☑ Development
```

## Krok 4: Deploy!

1. Jeśli dodawałeś zmienne po deploymencie → kliknij **Redeploy** w zakładce Deployments
2. Jeśli przed deploymentem → kliknij **Deploy**

## Krok 5: Sprawdź czy działa

Po deploymencie dostaniesz URL (np. `your-app.vercel.app`)

Sprawdź:
- `https://your-app.vercel.app` - powinien otworzyć się frontend
- `https://your-app.vercel.app/api/post` - powinien zwrócić dzisiejszy post z Google Sheets

## ✅ Gotowe!

Jeśli coś nie działa:
1. Sprawdź logi w Vercel Dashboard → Deployments → [latest] → Function Logs
2. Sprawdź czy wszystkie zmienne są dodane (Settings → Environment Variables)
3. Upewnij się, że zaznaczyłeś wszystkie 3 środowiska (Production, Preview, Development)

---

## 💡 Przydatne komendy

```bash
# Zobacz logi w czasie rzeczywistym
vercel logs your-app.vercel.app

# Redeploy z CLI
vercel --prod
```
