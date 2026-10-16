# Despliegue de upampi.com en tu VPS

Guía paso a paso para publicar el sitio en un VPS Ubuntu 22.04 / 24.04 con **Caddy** (recomendado, HTTPS automático) o **Nginx + Certbot**.

## Cómo está armado

| Pieza | Qué hace | Dónde vive en el servidor |
| --- | --- | --- |
| `dist/client/` | Sitio estático prerenderizado (HTML, JS, CSS, fuentes, OG) | `/var/www/upampi/current/dist/client` |
| `dist/server/entry.mjs` | Servidor Node de Astro. Solo atiende `POST /api/contact` | servicio systemd `upampi-contact` en `127.0.0.1:4321` |
| Caddy / Nginx | HTTPS, compresión, caché, cabeceras de seguridad, proxy de `/api/*` | `/etc/caddy/Caddyfile` o `/etc/nginx/sites-available/upampi.conf` |
| Variables secretas | Credenciales de correo | `/etc/upampi/contact.env` (nunca en git) |

Cada despliegue crea `/var/www/upampi/releases/<fecha>` y cambia el enlace `current` de forma atómica. Se conservan las últimas 3 releases para hacer rollback.

---

## 1. DNS

En el panel de tu proveedor de dominio crea:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| `A` | `@` (upampi.com) | IPv4 del VPS |
| `A` | `www` | IPv4 del VPS |
| `AAAA` | `@` | IPv6 del VPS (solo si tiene) |
| `AAAA` | `www` | IPv6 del VPS (solo si tiene) |

Comprueba la propagación: `dig +short upampi.com` y `dig +short www.upampi.com`.

## 2. Usuario, firewall y Node

Conéctate como root (o un usuario con sudo):

```bash
# usuario sin privilegios que ejecuta el servidor Node
sudo adduser --system --group --home /var/www/upampi upampi

# usuario para desplegar por SSH (puede ser el tuyo); dale acceso al directorio
sudo adduser deploy
sudo usermod -aG upampi deploy
sudo mkdir -p /var/www/upampi/releases
sudo chown -R deploy:upampi /var/www/upampi
sudo chmod -R 775 /var/www/upampi

# firewall: solo SSH, HTTP y HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Node.js LTS (22.x) desde NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs rsync
node -v   # debe ser >= 22.22
```

Permite que `deploy` reinicie el servicio y recargue el servidor web sin contraseña:

```bash
sudo visudo -f /etc/sudoers.d/upampi-deploy
```

```
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart upampi-contact, /usr/bin/systemctl reload caddy, /usr/bin/systemctl reload nginx, /usr/sbin/nginx -t, /usr/bin/journalctl -u upampi-contact *
```

Sube tu clave SSH pública al usuario `deploy` (`ssh-copy-id deploy@IP_DEL_VPS`).

## 3. Variables del formulario

```bash
sudo mkdir -p /etc/upampi
sudo nano /etc/upampi/contact.env
sudo chown root:upampi /etc/upampi/contact.env
sudo chmod 640 /etc/upampi/contact.env
```

Usa `.env.example` como plantilla. Elige **una** opción de envío:

```ini
CONTACT_TO=hola@upampi.com
CONTACT_FROM="UPAMPI Web <web@upampi.com>"
CONTACT_REPLY_TO=true

# Opción A: Resend (verifica el dominio upampi.com en Resend primero)
RESEND_API_KEY=re_xxxxxxxx

# Opción B: SMTP
# SMTP_HOST=smtp.tu-proveedor.com
# SMTP_PORT=587
# SMTP_USER=web@upampi.com
# SMTP_PASS=********
# SMTP_SECURE=false
```

Sin credenciales, en producción el endpoint responde `503` (para que no se pierdan mensajes en silencio). Para una prueba temporal sin correo, `CONTACT_DRY_RUN=true` registra el mensaje en el log y responde OK.

## 4. Servicio Node (systemd)

```bash
sudo cp deploy/upampi-contact.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable upampi-contact
# se inicia en el primer despliegue (paso 6)
```

Alternativa con PM2: `pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup`.

## 5A. Caddy (recomendado)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile          # cambia el correo de la sección global
sudo mkdir -p /var/log/caddy && sudo chown caddy:caddy /var/log/caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtiene y renueva los certificados de `upampi.com` y `www.upampi.com` automáticamente (los DNS deben apuntar ya al VPS y los puertos 80/443 estar abiertos).

## 5B. Nginx + Certbot (si el VPS ya usa Nginx)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /var/www/certbot
# primero obtén el certificado con un server block mínimo o con --nginx:
sudo certbot certonly --nginx -d upampi.com -d www.upampi.com
sudo cp deploy/nginx.conf /etc/nginx/sites-available/upampi.conf
sudo ln -s /etc/nginx/sites-available/upampi.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Al desplegar usa `WEB_SERVER=nginx`.

## 6. Primer despliegue

Desde tu máquina, en la carpeta del proyecto (en Windows usa **WSL**, que trae `rsync` y `ssh`):

```bash
VPS_HOST=IP_DEL_VPS VPS_USER=deploy ./deploy/deploy.sh
# con Nginx:
VPS_HOST=IP_DEL_VPS VPS_USER=deploy WEB_SERVER=nginx ./deploy/deploy.sh
```

El script:

1. ejecuta `npm ci` y `npm run build` (genera imágenes OG/íconos, revisa tipos y compila);
2. sube `dist/`, `package.json` y `package-lock.json` a `/var/www/upampi/releases/<fecha>`;
3. instala dependencias de producción (`npm ci --omit=dev`, solo 4 paquetes);
4. cambia `current` de forma atómica, reinicia `upampi-contact` y recarga Caddy/Nginx;
5. borra releases antiguas (conserva 3).

Variables opcionales: `VPS_PORT`, `REMOTE_DIR`, `SERVICE`, `KEEP`, `SKIP_BUILD=1`.

## 7. Actualizaciones

Cada cambio: `VPS_HOST=… VPS_USER=deploy ./deploy/deploy.sh`.

Con GitHub Actions (`.github/workflows/deploy.yml`) cada push a `main` despliega solo. Configura en el repositorio los secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS` (`ssh-keyscan -H IP_DEL_VPS`) y opcionalmente `VPS_PORT`.

## 8. Rollback

```bash
VPS_HOST=IP_DEL_VPS VPS_USER=deploy ./deploy/rollback.sh
```

Vuelve a la release anterior y reinicia los servicios. Manualmente: `ln -sfn /var/www/upampi/releases/<fecha> /var/www/upampi/current && sudo systemctl restart upampi-contact`.

## 9. Logs y diagnóstico

```bash
journalctl -u upampi-contact -f          # servidor del formulario
sudo journalctl -u caddy -f               # Caddy
tail -f /var/log/caddy/upampi.access.log  # accesos (Caddy)
sudo tail -f /var/log/nginx/upampi.error.log  # Nginx
systemctl status upampi-contact
curl -sI https://upampi.com | head -20    # cabeceras de seguridad y caché
```

## 10. Probar el formulario en producción

1. Abre `https://upampi.com/contacto`, llena el formulario y envíalo. Debes ver la pantalla “Gracias”.
2. Revisa el correo en `CONTACT_TO` y el log: `journalctl -u upampi-contact -n 20` debe mostrar `sent via resend` o `sent via smtp`.
3. Prueba de validación desde la terminal (debe responder `422`):

```bash
curl -s -X POST https://upampi.com/api/contact \
  -H 'Content-Type: application/json' -H 'Origin: https://upampi.com' \
  -d '{"name":"x"}'
```

4. Si responde `503`, revisa las credenciales en `/etc/upampi/contact.env` y reinicia: `sudo systemctl restart upampi-contact`.

## Antes de publicar: placeholders a confirmar

Todos están en `src/config/site.ts` salvo que se indique:

- `email` (`hola@upampi.com`), `replyTime` (“Respondemos en menos de 2 días hábiles.”), `socials` (LinkedIn, Instagram, GitHub).
- `bookingUrl`: hoy apunta a `/contacto?tipo=llamada`. Reemplázalo por tu enlace de Cal.com/Calendly. Si incrustas el widget, el CSP ya permite `cal.com` y `calendly.com` en `frame-src`.
- Correo de la sección global en `deploy/Caddyfile`.
- `src/pages/privacidad.astro`: borrador; revísalo con asesoría legal.
- Rangos de presupuesto del formulario: `src/data/contact.ts`.
