from urllib.parse import urlsplit


def validate_server_url(value):
    url = str(value).strip().rstrip('/')
    parsed = urlsplit(url)
    if not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError('URL do servidor inválida: não use credenciais, query ou fragmento.')
    if parsed.scheme != 'https' and not (
        parsed.scheme == 'http' and parsed.hostname in {'localhost', '127.0.0.1', '::1'}
    ):
        raise ValueError('O servidor remoto exige HTTPS. HTTP só é permitido em desenvolvimento local.')
    # Também rejeita portas inválidas antes de abrir a conexão.
    _ = parsed.port
    return url
