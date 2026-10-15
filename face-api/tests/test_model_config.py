import unittest

from app.model_config import (
    ALLOWED_MODULES,
    DETECTION_SIZE,
    MODEL_NAME,
)


class ModelConfigTest(unittest.TestCase):
    def test_mantem_modelo_compativel_com_embeddings_existentes(self):
        self.assertEqual(MODEL_NAME, "buffalo_l")

    def test_carrega_somente_modulos_necessarios(self):
        self.assertEqual(
            ALLOWED_MODULES,
            ("detection", "recognition"),
        )

    def test_resolucao_de_deteccao_controla_memoria(self):
        self.assertEqual(DETECTION_SIZE, (480, 480))


if __name__ == "__main__":
    unittest.main()

