# Guía de Despliegue en Producción (Oracle Cloud + DuckDNS)

Esta guía explica cómo llevar **Shorty** a producción utilizando una máquina virtual gratuita de Oracle Cloud, un dominio de DuckDNS y automatización mediante GitHub Actions.

## 1. Preparación de la Infraestructura

### A. Oracle Cloud & DuckDNS
1. Crea una instancia VM (ej. Ubuntu 24.04 o 22.04) en la capa *Always Free* de Oracle.
2. Abre los puertos **80 (HTTP)** y **443 (HTTPS)** en las **Security Lists / VCN** de Oracle Cloud.
3. Consigue la IP Pública de tu VM.
4. Entra a [DuckDNS](https://www.duckdns.org/) y crea un subdominio (ej. `mi-shorter.duckdns.org`). Apúntalo a tu IP Pública.

### B. Preparar el Servidor (Ubuntu)
Conéctate por SSH a tu VM y ejecuta:

```bash
# 1. Actualizar el sistema e instalar Nginx
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git curl

# 2. Abrir puertos en el Firewall interno de Ubuntu (iptables)
sudo iptables -I INPUT -p tcp -s 0.0.0.0/0 --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp -s 0.0.0.0/0 --dport 443 -j ACCEPT
sudo netfilter-persistent save

# 3. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
# (Sal y vuelve a entrar por SSH para que apliquen los permisos de docker)
```

## 2. Configuración de Nginx como Reverse Proxy
Vamos a enrutar el tráfico: `/api` y `/:shortCode` irán al Backend (puerto 3000), el resto irá al Frontend (puerto 8080).

1. Crea el archivo de configuración:
```bash
sudo nano /etc/nginx/sites-available/shorter
```

2. Pega este contenido (reemplaza `fedeva.duckdns.org` por tu dominio real):
```nginx
server {
    server_name shorty-fedeva.duckdns.org;

    # Enviar tráfico de la API al Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Enviar códigos cortos (exactamente 6 caracteres) al Backend
    location ~ "^/[a-zA-Z0-9]{6}$" {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # El resto del tráfico va al Frontend (React UI)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3. Activa la configuración, obtén el certificado SSL y reinicia:
```bash
sudo ln -s /etc/nginx/sites-available/shorter /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d shorty-fedeva.duckdns.org
sudo systemctl restart nginx
```

## 3. Preparación Inicial para CI/CD

El pipeline de GitHub necesita clonar y ejecutar el entorno una primera vez, pero primero debes configurar las carpetas y el `.env`.

Entra al servidor y ejecuta:
```bash
mkdir -p ~/shorter && cd ~/shorter

# Crea el archivo de variables de entorno global
nano .env
```

Pega tu configuración en el `.env` del servidor:
```env
# URL de la Base de Datos interna (PostgreSQL)
DATABASE_URL="postgresql://admin:admin_password@db:5432/shorter?schema=public"
PORT=3000
APP_DOMAIN="shorty-fedeva.duckdns.org"
```

## 4. Configurar secretos en GitHub (Para la CI/CD)

Ve a tu repositorio en GitHub > **Settings** > **Secrets and variables** > **Actions** y añade los siguientes **Repository secrets**:

- `SERVER_IP`: La IP pública de tu VM Oracle.
- `SERVER_USER`: `ubuntu` (o el usuario de tu VM).
- `SSH_PRIVATE_KEY`: El contenido de tu llave privada SSH (`~/.ssh/id_rsa` o `.pem`) que usas para conectarte al servidor.

¡Con eso configurado, cada vez que hagas `git push` a la rama `main` o `develop`, GitHub Actions automatizará el despliegue!
