import math
import unittest

from app.face_rules import (
    MAX_IMAGE_BYTES,
    embedding_valido,
    estimar_pose_por_pontos,
    limitar_bbox,
    validar_metadados_upload,
)


class FaceRulesTest(unittest.TestCase):
    def test_upload_jpeg_valido(self):
        self.assertIsNone(
            validar_metadados_upload("image/jpeg", 1024)
        )

    def test_upload_rejeita_formato_nao_permitido(self):
        erro = validar_metadados_upload("application/pdf", 1024)
        self.assertEqual(erro[0], 415)

    def test_upload_rejeita_imagem_vazia(self):
        erro = validar_metadados_upload("image/png", 0)
        self.assertEqual(erro[0], 400)

    def test_upload_rejeita_arquivo_acima_do_limite(self):
        erro = validar_metadados_upload(
            "image/webp",
            MAX_IMAGE_BYTES + 1,
        )
        self.assertEqual(erro[0], 413)

    def test_bbox_fica_dentro_da_imagem(self):
        self.assertEqual(
            limitar_bbox((-20, -5, 900, 700), 640, 480),
            (0, 0, 640, 480),
        )

    def test_embedding_insightface_valido(self):
        embedding = [0.0] * 511 + [1.0]
        self.assertTrue(embedding_valido(embedding))

    def test_embedding_rejeita_dimensao_incorreta(self):
        self.assertFalse(embedding_valido([1.0, 0.0]))

    def test_embedding_rejeita_nan(self):
        embedding = [0.0] * 511 + [math.nan]
        self.assertFalse(embedding_valido(embedding))

    def test_embedding_rejeita_vetor_sem_norma(self):
        self.assertFalse(embedding_valido([0.0] * 512))

    def test_pose_frontal_por_cinco_pontos(self):
        pose = estimar_pose_por_pontos([
            (30, 30),
            (70, 30),
            (50, 50),
            (35, 70),
            (65, 70),
        ])

        self.assertIsNotNone(pose)
        pitch, yaw, roll = pose
        self.assertAlmostEqual(pitch, 0.0)
        self.assertAlmostEqual(yaw, 0.0)
        self.assertAlmostEqual(roll, 0.0)

    def test_pose_detecta_movimento_horizontal(self):
        pose = estimar_pose_por_pontos([
            (30, 30),
            (70, 30),
            (58, 50),
            (35, 70),
            (65, 70),
        ])

        self.assertIsNotNone(pose)
        self.assertGreaterEqual(abs(pose[1]), 12.0)

    def test_pose_rejeita_pontos_invalidos(self):
        self.assertIsNone(estimar_pose_por_pontos(None))
        self.assertIsNone(estimar_pose_por_pontos([(1, 2)]))
        self.assertIsNone(
            estimar_pose_por_pontos([
                (10, 10),
                (10, 10),
                (10, 20),
                (5, 30),
                (15, 30),
            ])
        )


if __name__ == "__main__":
    unittest.main()

