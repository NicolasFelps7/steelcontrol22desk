# Dashboard industrial dinâmico

O Desktop e o Mobile usam o mesmo contrato para montar indicadores de qualquer máquina sem criar uma tela nova para cada fabricante.

## Origem dos dados

- `dadosExtrasAtuais`: telemetria real e mutável enviada pelo Edge/controlador.
- `integracaoMeta.dashboard`: somente a descrição das seções e indicadores específicos daquela máquina.
- Campos comuns da máquina continuam sendo aceitos para compatibilidade.

Somente valores presentes em `dadosExtrasAtuais` são tratados como telemetria. Se uma seção não tiver nenhum sinal publicado, ela fica oculta. Isso evita interpretar valores padrão do cadastro como dados reais.

## Campos padronizados

| Grupo | Caminhos recomendados | Unidade |
|---|---|---|
| OEE | `kpi.oee`, `kpi.availability`, `kpi.performance`, `kpi.quality` | `%` ou razão `0..1` |
| Ciclo | `kpi.cycleTimeSec`, `kpi.targetCycleTimeSec` | `s` |
| Produção | `quality.goodCount`, `quality.rejectCount` | `un.` |
| Rastreabilidade | `production.workOrder`, `production.batch`, `production.recipe` | texto |
| Segurança | `safety.estopOk`, `safety.doorClosed`, `safety.startPermit` | booleano |
| Manutenção | `maintenance.runtimeHours`, `maintenance.mtbfHours`, `maintenance.mttrMinutes`, `maintenance.toolLifePercent` | conforme campo |
| Energia | `energy.powerKw`, `energy.totalKwh` | `kW`, `kWh` |
| Utilidades | `utilities.airPressureBar` | `bar` |

## Seções específicas da máquina

Cadastre a estrutura abaixo em `integracaoMeta`. Cada indicador aponta para um caminho da telemetria. `paths` permite nomes alternativos; o primeiro valor disponível é usado.

```json
{
  "dashboard": {
    "version": 1,
    "sections": [
      {
        "id": "hydraulic",
        "title": "Sistema hidráulico",
        "caption": "Pressão e temperatura do circuito principal.",
        "icon": "gauge",
        "metrics": [
          {
            "label": "Pressão principal",
            "paths": ["hydraulic.pressureBar", "pressure.mainBar"],
            "unit": "bar",
            "icon": "gauge"
          },
          {
            "label": "Temperatura do óleo",
            "path": "hydraulic.oilTemperatureC",
            "unit": "°C",
            "icon": "temperature"
          }
        ]
      }
    ]
  }
}
```

Exemplo correspondente em `dadosExtrasAtuais`:

```json
{
  "kpi": {
    "availability": 0.94,
    "performance": 0.89,
    "quality": 0.98,
    "cycleTimeSec": 12.4,
    "targetCycleTimeSec": 11.8
  },
  "production": {
    "workOrder": "OP-2048",
    "batch": "L-09",
    "recipe": "PECA-A"
  },
  "quality": { "goodCount": 487, "rejectCount": 6 },
  "safety": { "estopOk": true, "doorClosed": true, "startPermit": true },
  "maintenance": { "runtimeHours": 1840, "mtbfHours": 620, "mttrMinutes": 28 },
  "energy": { "powerKw": 7.4, "totalKwh": 12580 },
  "hydraulic": { "pressureBar": 86.2, "oilTemperatureC": 43.5 }
}
```

## Ícones suportados

`temperature`, `thermostat`, `vibration`, `energy`, `bolt`, `production`, `inventory`, `safety`, `shield`, `maintenance`, `build`, `network`, `wifi`, `speed` e `gauge`. Nomes desconhecidos usam um ícone industrial neutro.

## Segurança operacional

Os indicadores de segurança são supervisórios. Eles não substituem relés, CLPs de segurança, cercas, botões de emergência ou procedimentos certificados. Comandos continuam passando pelas regras, permissões e filas existentes do SteelControl.
