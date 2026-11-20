# E-mails de connexion CVLibre (FR / EN)

A coller dans Supabase, projet CVLibre : Authentication > Emails (Templates).
Le texte s'affiche en anglais si l'utilisateur vient de la version anglaise (user_metadata.lang = "en"), sinon en français.

## 1. Magic Link

Subject :

```
Connexion à CVLibre / Sign in to CVLibre
```

Message body :

```html
{{ if eq .Data.lang "en" }}
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin:0 0 16px">Sign in to CVLibre</h2>
  <p>Click the button below to sign in to your CVLibre account. The link works once and expires after one hour.</p>
  <p style="margin:24px 0"><a href="{{ .ConfirmationURL }}" style="background:#1f6feb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Sign in</a></p>
  <p style="color:#666;font-size:13px">If you did not ask to sign in, you can ignore this email.</p>
  <p style="color:#666;font-size:13px">CVLibre - free CV builder<br><a href="https://cvlibre.com/en/" style="color:#666">cvlibre.com/en</a></p>
</div>
{{ else }}
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin:0 0 16px">Connexion à CVLibre</h2>
  <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte CVLibre. Le lien ne fonctionne qu'une fois et expire au bout d'une heure.</p>
  <p style="margin:24px 0"><a href="{{ .ConfirmationURL }}" style="background:#1f6feb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Me connecter</a></p>
  <p style="color:#666;font-size:13px">Si vous n'avez pas demandé à vous connecter, ignorez simplement cet e-mail.</p>
  <p style="color:#666;font-size:13px">CVLibre - créateur de CV gratuit<br><a href="https://cvlibre.com/" style="color:#666">cvlibre.com</a></p>
</div>
{{ end }}
```

## 2. Confirm signup

Subject :

```
Bienvenue sur CVLibre / Welcome to CVLibre
```

Message body :

```html
{{ if eq .Data.lang "en" }}
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin:0 0 16px">Welcome to CVLibre</h2>
  <p>Click the button below to confirm your email and open your free account. Your CVs and letters will be saved online.</p>
  <p style="margin:24px 0"><a href="{{ .ConfirmationURL }}" style="background:#1f6feb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Confirm my email</a></p>
  <p style="color:#666;font-size:13px">If you did not create an account, you can ignore this email.</p>
  <p style="color:#666;font-size:13px">CVLibre - free CV builder<br><a href="https://cvlibre.com/en/" style="color:#666">cvlibre.com/en</a></p>
</div>
{{ else }}
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin:0 0 16px">Bienvenue sur CVLibre</h2>
  <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse et ouvrir votre compte gratuit. Vos CV et lettres seront sauvegardés en ligne.</p>
  <p style="margin:24px 0"><a href="{{ .ConfirmationURL }}" style="background:#1f6feb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Confirmer mon adresse</a></p>
  <p style="color:#666;font-size:13px">Si vous n'avez pas créé de compte, ignorez simplement cet e-mail.</p>
  <p style="color:#666;font-size:13px">CVLibre - créateur de CV gratuit<br><a href="https://cvlibre.com/" style="color:#666">cvlibre.com</a></p>
</div>
{{ end }}
```
