# coding: utf-8
"""Diagnostico somente leitura da COM do Dobot Magician Lite.
Nao envia STOP, HOME, PTP, limpeza de fila nem limpeza de alarmes.
"""
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent
EDGE = ROOT / 'steelcontrol-edge'


def append_log(message):
    print(message, flush=True)
    with (ROOT / 'RESULTADO_DIAGNOSTICO_COM4.txt').open('a', encoding='utf-8') as f:
        f.write(f'[{datetime.now().isoformat(timespec="seconds")}] {message}\n')


def ask_color(title):
    print('\n' + title)
    print('Digite: V=verde, A=amarelo, R=vermelho, O=outra cor. Se nao souber, use O.')
    raw = input('Cor do LED neste momento: ').strip().upper()[:1]
    mapped = {'V': 'VERDE', 'A': 'AMARELO', 'R': 'VERMELHO', 'O': 'OUTRA'}
    answer = mapped.get(raw, 'NAO INFORMADA')
    append_log(f'{title}: {answer}')
    return answer


def main():
    append_log('=== DIAGNOSTICO DOBOT COM4 (SOMENTE LEITURA) ===')
    append_log('Nenhum comando de movimento, HOME, STOP ou limpeza de fila/alarme sera enviado.')
    append_log('Feche SteelControl Edge, DobotLab e DobotStudio antes de continuar.')
    append_log('O Dobot deve estar parado, com LED verde e area de trabalho livre.')
    if not EDGE.is_dir():
        append_log('ERRO: coloque estes dois arquivos na pasta principal steelcontrol22desk.')
        return 2
    try:
        import serial
        sys.path.insert(0, str(EDGE))
        from adapters.dobot_adapter import DobotMagicianAdapter
    except ImportError as exc:
        append_log(f'ERRO: nao foi possivel carregar pyserial/adapter: {exc}')
        append_log('Use o Python do Edge instalado em .venv-edge.')
        return 2
    if ask_color('FASE 0 - Antes de abrir a COM4') != 'VERDE':
        append_log('Teste interrompido: LED nao estava verde antes da abertura.')
        return 1
    if input('Pressione ENTER para abrir a COM4 SEM ENVIAR COMANDOS (ou escreva CANCELAR): ').strip():
        append_log('Cancelado pelo operador.')
        return 1
    ser = serial.Serial(port=None, baudrate=115200, timeout=0.7, write_timeout=0.7)
    # Ajustar DTR/RTS ANTES de abrir reduz a chance de reset no hardware.
    # Alguns drivers Windows ainda podem gerar um breve pulso na abertura.
    ser.dtr = False
    ser.rts = False
    ser.port = 'COM4'
    try:
        ser.open()
        append_log('FASE 1 - COM4 aberta. NENHUM byte foi enviado pelo script.')
        status = ask_color('FASE 1 - COM4 aberta, sem nenhuma leitura ou escrita')
        if status != 'VERDE':
            append_log('CONCLUSAO PARCIAL: a mudança ocorreu apenas com a abertura da COM4.')
            append_log('Hipotese: reset via DTR/RTS/driver USB ou outra interferencia na porta.')
            append_log('Nao envie outros comandos ate inspecionar o dispositivo.')
            return 0
        answer = input('\nO LED segue verde. Ler APENAS coordenadas/estado de alarmes? [S/N]: ').strip().upper()
        if answer not in ('S', 'SIM'):
            append_log('Leitura nao autorizada pelo operador; encerrando.')
            return 0
        driver = DobotMagicianAdapter({'serialPort': 'COM4', 'baud': 115200})
        driver.ser = ser
        driver.port = 'COM4'
        # Estes metodos fazem somente consultas com rw=0: id 10 (pose), id 20 (alarmes).
        try:
            pose = driver._get_pose()
            append_log('FASE 2 - Leitura GetPose (id 10, somente leitura) retornou: ' +
                       ', '.join(f'{k.upper()}={v:.3f}' for k, v in pose.items()))
            alarms = driver._alarms()
            append_log(f'FASE 2 - Leitura GetAlarmsState (id 20, somente leitura) retornou: {alarms}')
        except Exception as exc:
            append_log(f'Falha na consulta somente leitura: {type(exc).__name__}: {exc}')
        status = ask_color('FASE 2 - Apos as leituras (nenhum comando de movimento)')
        if status == 'VERDE':
            append_log('RESULTADO: abrir COM4 e ler pose/alarmes nao mudou o LED neste teste.')
            append_log('Proximo suspeito: comandos ativos enviados pelo Edge na conexao (241/245).')
        else:
            append_log('RESULTADO: LED mudou apos as consultas de leitura; investigar protocolo/estado da controladora.')
        return 0
    except Exception as exc:
        append_log(f'ERRO ao abrir/testar COM4: {type(exc).__name__}: {exc}')
        append_log('Confirme que nenhuma outra aplicacao usa a COM4.')
        return 2
    finally:
        if ser.is_open:
            ser.close()
            append_log('Porta COM4 fechada; nenhuma tentativa de movimentacao foi feita.')
        append_log('Resultado salvo em RESULTADO_DIAGNOSTICO_COM4.txt')


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        append_log('Cancelado pelo operador (Ctrl+C).')
        sys.exit(130)
