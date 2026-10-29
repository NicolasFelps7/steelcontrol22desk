"""Monta o download Windows com o mesmo Desktop/Edge usado por npm start."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'frontend/downloads/SteelControl-Edge-Windows.zip'


def main():
    files = [ROOT / 'INSTALAR_STEELCONTROL_EDGE.ps1']
    for folder in ['steelcontrol-edge', 'desktop']:
        for file in (ROOT / folder).rglob('*'):
            relative = file.relative_to(ROOT / folder)
            if any(part in {'node_modules', '__pycache__', 'tests', 'test', 'release', 'edge-dist', 'build-edge'} for part in relative.parts):
                continue
            if file.is_file() and file.suffix not in {'.pyc', '.zip'}:
                files.append(file)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(TARGET, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('LEIA-ME.txt',
            'SteelControl Edge integrado ao Railway\n\n'
            'Requisitos: Windows, Node.js 22 LTS, Python 3.11+ e internet.\n'
            'Extraia toda a pasta e execute INSTALAR_STEELCONTROL_EDGE.ps1.\n'
            'Abra o Edge, entre na empresa e clique em Vincular este computador.\n'
            'Cadastre o Dobot como equipamento real; selecione Dobot Magician, a COM e 115200.\n'
            'Salvar e conectar confirma a conexao somente depois da primeira telemetria.\n'
            'Feche DobotStudio e o Edge antigo antes de iniciar.\n')
        for file in sorted(set(files)):
            archive.write(file, file.relative_to(ROOT).as_posix())
    print(f'Pacote Edge atualizado: {TARGET.name} ({TARGET.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
