#!/usr/bin/env bash
# Gera certificado TLS autoassinado (RSA) para HTTPS / PWA (contexto seguro).
# Requer OpenSSL 1.1.1+ (opção -addext).
#
# O campo CN no Distinguished Name tem limite de 64 caracteres; FQDNs longos
# (ex. GCP internal) vão para o SAN como DNS:... com o nome completo.
#
# Variáveis opcionais:
#   CERT_CN          Nome lógico / hostname (default: hostname -f ou hostname)
#   CERT_EXTRA_SAN   SAN extra, ex.: IP:203.0.113.10,DNS:meu.dominio
#   CERT_DAYS        Validade em dias (default: 825)
#   RENEW_SELF_CERT  se 1, regera mesmo que já existam ficheiros

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT/data/certs"
KEY="$CERT_DIR/selfsigned.key"
CRT="$CERT_DIR/selfsigned.crt"

if ! command -v openssl >/dev/null 2>&1; then
  echo "Erro: openssl não encontrado. Instale openssl (ex.: apt install openssl)." >&2
  exit 1
fi

mkdir -p "$CERT_DIR"

if [ -f "$KEY" ] && [ -f "$CRT" ] && [ "${RENEW_SELF_CERT:-0}" != "1" ]; then
  echo "Certificados já existentes em $CERT_DIR (use RENEW_SELF_CERT=1 para substituir)."
  exit 0
fi

FULL_HOSTNAME="${CERT_CN:-$(hostname -f 2>/dev/null || hostname)}"

# CN no subject: máximo 64 caracteres (ASN.1 / OpenSSL)
CERT_SUBJ_CN="$FULL_HOSTNAME"
if [ "${#CERT_SUBJ_CN}" -gt 64 ]; then
  SHORT_HOST="$(hostname -s 2>/dev/null || echo "$FULL_HOSTNAME" | cut -d. -f1)"
  CERT_SUBJ_CN="satorx-${SHORT_HOST}"
  if [ "${#CERT_SUBJ_CN}" -gt 64 ]; then
    CERT_SUBJ_CN="${CERT_SUBJ_CN:0:64}"
  fi
  echo "   (FQDN > 64 chars; CN do subject truncado para \"$CERT_SUBJ_CN\"; nome completo no SAN)"
fi

CERT_DAYS="${CERT_DAYS:-825}"
SAN="DNS:localhost,IP:127.0.0.1"
if [ -n "$FULL_HOSTNAME" ] && [ "$FULL_HOSTNAME" != "localhost" ]; then
  SAN="${SAN},DNS:${FULL_HOSTNAME}"
fi
if [ -n "${CERT_EXTRA_SAN:-}" ]; then
  SAN="${SAN},${CERT_EXTRA_SAN}"
fi

echo "-> Gerando certificado autoassinado (CN=$CERT_SUBJ_CN, SAN=$SAN)..."

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$KEY" -out "$CRT" \
  -days "$CERT_DAYS" \
  -subj "/O=SatorX/CN=${CERT_SUBJ_CN}" \
  -addext "subjectAltName=${SAN}"

chmod 600 "$KEY"
chmod 644 "$CRT"
echo "   Chave: $KEY"
echo "   Cert:  $CRT"
