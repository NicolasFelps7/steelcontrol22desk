"""Regras puras da Face API.

Este modulo nao carrega o modelo InsightFace. Assim, as validacoes podem ser
testadas rapidamente sem baixar o buffalo_l ou inicializar o ONNX Runtime.
"""

from collections.abc import Sequence
from math import atan2, degrees, hypot, isfinite, sqrt


TIPOS_IMAGEM_PERMITIDOS = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_IMAGE_BYTES = 4 * 1024 * 1024
TAMANHO_EMBEDDING = 512


def estimar_pose_por_pontos(
    pontos: Sequence[Sequence[float]] | None,
) -> tuple[float, float, float] | None:
    """Estima pitch, yaw e roll usando os cinco pontos do detector.

    A estimativa serve somente para orientar a prova de vida por movimento.
    A autenticacao continua baseada no embedding de reconhecimento do
    ``buffalo_l``. Assim, nao e necessario carregar o modelo auxiliar pesado
    de landmarks 3D apenas para obter a direcao aproximada da cabeca.
    """

    if pontos is None or len(pontos) < 5:
        return None

    try:
        coordenadas = [
            (float(ponto[0]), float(ponto[1]))
            for ponto in pontos[:5]
        ]
    except (IndexError, TypeError, ValueError):
        return None

    if not all(
        isfinite(valor)
        for ponto in coordenadas
        for valor in ponto
    ):
        return None

    olho_esquerdo, olho_direito, nariz, boca_esquerda, boca_direita = (
        coordenadas
    )

    distancia_olhos = hypot(
        olho_direito[0] - olho_esquerdo[0],
        olho_direito[1] - olho_esquerdo[1],
    )

    if distancia_olhos < 1.0:
        return None

    centro_olhos = (
        (olho_esquerdo[0] + olho_direito[0]) / 2.0,
        (olho_esquerdo[1] + olho_direito[1]) / 2.0,
    )
    centro_boca = (
        (boca_esquerda[0] + boca_direita[0]) / 2.0,
        (boca_esquerda[1] + boca_direita[1]) / 2.0,
    )
    altura_face = hypot(
        centro_boca[0] - centro_olhos[0],
        centro_boca[1] - centro_olhos[1],
    )

    if altura_face < 1.0:
        return None

    yaw = (
        (nariz[0] - centro_olhos[0])
        / distancia_olhos
    ) * 90.0

    proporcao_vertical_nariz = (
        (nariz[1] - centro_olhos[1])
        / altura_face
    )
    pitch = (proporcao_vertical_nariz - 0.5) * 90.0

    roll = degrees(
        atan2(
            olho_direito[1] - olho_esquerdo[1],
            olho_direito[0] - olho_esquerdo[0],
        )
    )

    def limitar_angulo(valor: float) -> float:
        return max(-45.0, min(45.0, valor))

    return (
        limitar_angulo(pitch),
        limitar_angulo(yaw),
        limitar_angulo(roll),
    )


def validar_metadados_upload(
    content_type: str | None,
    tamanho_bytes: int,
) -> tuple[int, str] | None:
    """Retorna ``(status HTTP, mensagem)`` quando o upload for invalido."""

    if content_type not in TIPOS_IMAGEM_PERMITIDOS:
        return 415, "Formato de imagem nao suportado."

    if tamanho_bytes <= 0:
        return 400, "Imagem vazia."

    if tamanho_bytes > MAX_IMAGE_BYTES:
        return 413, "Imagem maior que o limite de 4 MB."

    return None


def limitar_bbox(
    bbox: Sequence[float],
    largura: int,
    altura: int,
) -> tuple[int, int, int, int]:
    """Mantem a caixa facial dentro dos limites da imagem."""

    x1, y1, x2, y2 = (int(valor) for valor in bbox)

    return (
        max(0, min(x1, largura)),
        max(0, min(y1, altura)),
        max(0, min(x2, largura)),
        max(0, min(y2, altura)),
    )


def embedding_valido(
    embedding: Sequence[float] | None,
    tamanho_esperado: int = TAMANHO_EMBEDDING,
) -> bool:
    """Valida dimensao, numeros finitos e norma de um embedding facial."""

    if embedding is None or len(embedding) != tamanho_esperado:
        return False

    try:
        numeros = [float(valor) for valor in embedding]
    except (TypeError, ValueError):
        return False

    if not all(isfinite(valor) for valor in numeros):
        return False

    norma = sqrt(sum(valor * valor for valor in numeros))
    return norma > 0

