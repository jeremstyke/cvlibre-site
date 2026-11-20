# E-mails de connexion CVLibre (FR / EN / DE), connexion par code

Envoyés par Resend (SMTP réglé dans Supabase). A coller dans Supabase, projet cvlibre :
Authentication > Emails > Templates. Le texte suit la langue du site d'où vient la personne
(user_metadata.lang : "en" pour toutes les versions anglaises, "de", sinon français).
Chaque e-mail contient le code ({{ .Token }}) en gros et le lien de connexion en secours.

## 1. Magic Link (personne qui a déjà un compte)

Subject :

```
Votre code CVLibre / Your CVLibre code / Ihr CVLibre-Code
```

Message body :

```html
{{ if eq .Data.lang "en" }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Your sign-in code</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Here is your code to sign in to CVLibre:</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Enter it in the sign-in window. It is valid for 1 hour and works only once.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">You can also click this button:</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Sign in</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Didn't ask for this? Just ignore this email. Nobody can sign in without this code.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, founder of CVLibre<br><a href="https://cvlibre.com/en/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · The free CV builder</p>
  </div>
</div>
{{ else if eq .Data.lang "de" }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Ihr Anmeldecode</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Hier ist Ihr Code für die Anmeldung bei CVLibre:</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Geben Sie ihn im Anmeldefenster ein. Er ist 1 Stunde gültig und funktioniert nur einmal.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">Sie können auch auf diese Schaltfläche klicken:</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Anmelden</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Nichts angefordert? Ignorieren Sie diese E-Mail einfach. Ohne diesen Code kann sich niemand anmelden.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, Gründer von CVLibre<br><a href="https://cvlibre.com/de/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · Der kostenlose Lebenslauf-Generator</p>
  </div>
</div>
{{ else }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Votre code de connexion</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Voici votre code pour vous connecter à CVLibre :</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Saisissez-le dans la fenêtre de connexion. Il est valable 1 heure et ne sert qu'une fois.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">Vous pouvez aussi cliquer sur ce bouton :</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Me connecter</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Vous n'avez rien demandé ? Ignorez simplement cet e-mail, personne ne pourra se connecter sans ce code.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, créateur de CVLibre<br><a href="https://cvlibre.com/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · Le créateur de CV gratuit</p>
  </div>
</div>
{{ end }}
```

## 2. Confirm signup (première connexion d'une nouvelle adresse)

Subject :

```
Bienvenue sur CVLibre / Welcome to CVLibre / Willkommen bei CVLibre
```

Message body :

```html
{{ if eq .Data.lang "en" }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Welcome to CVLibre</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Here is your code to activate your free CVLibre account:</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Enter it in the sign-in window. It is valid for 1 hour and works only once.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">You can also click this button:</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Sign in</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Didn't ask for this? Just ignore this email. Nobody can sign in without this code.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, founder of CVLibre<br><a href="https://cvlibre.com/en/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · The free CV builder</p>
  </div>
</div>
{{ else if eq .Data.lang "de" }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Willkommen bei CVLibre</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Hier ist Ihr Code, um Ihr kostenloses CVLibre-Konto zu aktivieren:</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Geben Sie ihn im Anmeldefenster ein. Er ist 1 Stunde gültig und funktioniert nur einmal.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">Sie können auch auf diese Schaltfläche klicken:</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Anmelden</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Nichts angefordert? Ignorieren Sie diese E-Mail einfach. Ohne diesen Code kann sich niemand anmelden.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, Gründer von CVLibre<br><a href="https://cvlibre.com/de/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · Der kostenlose Lebenslauf-Generator</p>
  </div>
</div>
{{ else }}
<div style="background:#f3f5fa;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 10px rgba(20,30,60,.06)">
    <p style="margin:0 0 24px;text-align:center;font-size:26px;font-weight:800;letter-spacing:-.5px"><span style="color:#1a1f36">CV</span><span style="color:#1f4fd8">libre</span></p>
    <h1 style="margin:0 0 12px;font-size:22px;text-align:center;color:#1a1f36">Bienvenue sur CVLibre</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;text-align:center;color:#3c4257">Voici votre code pour activer votre compte gratuit CVLibre :</p>
    <p style="margin:0 0 20px;text-align:center"><span style="display:inline-block;background:#eef2fd;border:2px solid #1f4fd8;border-radius:12px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1f4fd8">{{ .Token }}</span></p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;text-align:center;color:#3c4257">Saisissez-le dans la fenêtre de connexion. Il est valable 1 heure et ne sert qu'une fois.</p>
    <p style="margin:0 0 12px;font-size:14px;text-align:center;color:#697386">Vous pouvez aussi cliquer sur ce bouton :</p>
    <p style="margin:0 0 28px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f4fd8;color:#ffffff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px">Me connecter</a></p>
    <p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#697386;border-top:1px solid #e6e9f0;padding-top:18px">Vous n'avez rien demandé ? Ignorez simplement cet e-mail, personne ne pourra se connecter sans ce code.</p>
    <p style="margin:0;font-size:14px;color:#3c4257">Jérémy, créateur de CVLibre<br><a href="https://cvlibre.com/" style="color:#1f4fd8;text-decoration:none">cvlibre.com</a> · Le créateur de CV gratuit</p>
  </div>
</div>
{{ end }}
```
