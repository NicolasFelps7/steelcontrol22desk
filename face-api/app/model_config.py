"""Configuracao enxuta e compativel do modelo facial do SteelControl.

O pacote ``buffalo_l`` contem modelos auxiliares de idade, genero e landmarks
detalhados. O SteelControl precisa somente da deteccao e do reconhecimento para
gerar o mesmo embedding facial de 512 posicoes usado pelo backend.
"""

MODEL_NAME = "buffalo_l"
ALLOWED_MODULES = ("detection", "recognition")
# A camera do navegador envia o rosto centralizado e proximo. 320x320 reduz
# bastante o custo do SCRFD em CPU sem trocar o modelo de reconhecimento nem
# alterar o tamanho dos embeddings (512 posicoes).
DETECTION_SIZE = (320, 320)
