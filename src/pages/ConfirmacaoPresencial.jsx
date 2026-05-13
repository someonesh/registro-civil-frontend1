import { useState } from 'react'
import api from '../services/api'

export default function ConfirmacaoPresencial() {
  const [refHospital, setRefHospital] = useState('')
  const [preRegisto, setPreRegisto] = useState(null)
  const [tipo, setTipo] = useState('nascimento')
  const [erro, setErro] = useState(null)
  const [mensagem, setMensagem] = useState(null)
  const [conservador, setConservador] = useState('Rollins da Conceição Chanesa')

  const [form, setForm] = useState({
    nome_completo: '',
    apelidos: '',
    avo_paterno: '',
    avo_paterna: '',
    avo_materno: '',
    avo_materna: '',
    nome_declarante: '',
    bi_declarante: '',
    estado_civil_declarante: '',
    residencia_declarante: '',
    relacao_declarante: 'outro',
    cemiterio: '',
    herdeiros: '',
    bens_inventario: false,
    testamento: false
  })

  const buscar = () => {
    setErro(null)
    setMensagem(null)
    setPreRegisto(null)

    const url =
      tipo === 'nascimento'
        ? `/nascimento/${refHospital}`
        : `/obito/${refHospital}`

    api.get(url)
      .then(r => {
        setPreRegisto(r.data)

        if (tipo === 'nascimento') {
          setForm(f => ({
            ...f,
            nome_completo: r.data.nome_completo || '',
            apelidos: r.data.apelidos || '',
            avo_paterno: r.data.avo_paterno || '',
            avo_paterna: r.data.avo_paterna || '',
            avo_materno: r.data.avo_materno || '',
            avo_materna: r.data.avo_materna || '',
            nome_declarante: r.data.nome_declarante || '',
            bi_declarante: r.data.bi_declarante || '',
            estado_civil_declarante: r.data.estado_civil_declarante || '',
            residencia_declarante: r.data.residencia_declarante || '',
            relacao_declarante: r.data.relacao_declarante || 'outro'
          }))
        } else {
          setForm(f => ({
            ...f,
            cemiterio: r.data.cemiterio || '',
            herdeiros: r.data.herdeiros || '',
            bens_inventario: r.data.bens_inventario || false,
            testamento: r.data.testamento || false,
          }))
        }
      })
      .catch(() =>
        setErro('Pré-registo não encontrado. Verifica o ID.')
      )
  }

  const confirmar = () => {
    setErro(null)

    if (tipo === 'nascimento') {

      api.post('/nascimento/fase2', {
        ref_hospital: preRegisto.ref_hospital,
        api_key: 'PRESENCIAL',
        ...form
      })
      .then(() => {
        setMensagem('Dados confirmados. O registo aguarda aprovação do conservador.')
        setPreRegisto(null)
      })
      .catch(e =>
        setErro(e.response?.data?.detail || 'Erro ao confirmar.')
      )

    } else {

      api.post('/obito/fase2', {
        ref_hospital: preRegisto.ref_hospital,
        api_key: 'PRESENCIAL',
        cemiterio: form.cemiterio,
        herdeiros: form.herdeiros,
        bens_inventario: form.bens_inventario,
        testamento: form.testamento,
      })
      .then(() => {
        setMensagem('Dados confirmados. O registo aguarda aprovação do conservador.')
        setPreRegisto(null)
      })
      .catch(e =>
        setErro(e.response?.data?.detail || 'Erro ao confirmar.')
      )

    }
  }

  const Campo = ({ label, value, onChange, type = 'text' }) => (
    <div>
      <label className="block text-xs text-[#718096] uppercase tracking-wide mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-[#CBD5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#009A44]"
      />
    </div>
  )

  return (
    <div
      className="p-8 max-w-4xl"
      style={{ fontFamily: "'Georgia', serif" }}
    >

      <div className="mb-6 pb-4 border-b-2 border-[#003F20]">
        <h2 className="text-2xl font-bold text-[#003F20]">
          Confirmação Presencial
        </h2>

        <p className="text-sm text-[#718096] mt-1">
          Para encarregados que se deslocam ao balcão do registo civil
        </p>
      </div>

      {mensagem && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* Busca */}
      <div
        className="bg-white border border-[#E2E8F0] rounded p-5 mb-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >

        <h3 className="text-xs font-bold text-[#003F20] uppercase tracking-wide mb-4">
          Localizar Pré-registo
        </h3>

        <div className="flex gap-3 items-end">

          <div className="flex-1">
            <label className="block text-xs text-[#718096] uppercase tracking-wide mb-1">
              Tipo
            </label>

            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full border border-[#CBD5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#009A44]"
            >
              <option value="nascimento">Nascimento</option>
              <option value="obito">Óbito</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-[#718096] uppercase tracking-wide mb-1">
              ID do Pré-registo
            </label>

            <input
              value={refHospital}
              onChange={e => setRefHospital(e.target.value)}
              placeholder="Ex: 3"
              className="w-full border border-[#CBD5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#009A44]"
            />
          </div>

          <button
            onClick={buscar}
            className="px-6 py-2.5 rounded text-sm font-bold text-white"
            style={{ backgroundColor: '#003F20' }}
          >
            Localizar
          </button>

        </div>
      </div>

      {/* Dados encontrados */}
      {preRegisto && (

        <div
          className="bg-white border border-[#E2E8F0] rounded p-5 mb-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >

          <h3 className="text-xs font-bold text-[#003F20] uppercase tracking-wide mb-4">
            Dados Recebidos do Hospital
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm mb-5">

            {tipo === 'nascimento' && (
              <>
                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Sexo</p>
                  <p className="font-semibold">
                    {preRegisto.sexo_bebe === 'M'
                      ? 'Masculino'
                      : 'Feminino'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">
                    Data Nascimento
                  </p>
                  <p className="font-semibold">
                    {preRegisto.data_nascimento}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Pai</p>
                  <p className="font-semibold">
                    {preRegisto.nome_pai || 'Não declarado'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Mãe</p>
                  <p className="font-semibold">
                    {preRegisto.nome_mae}
                  </p>
                </div>
              </>
            )}

            {tipo === 'obito' && (
              <>
                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Falecido</p>
                  <p className="font-semibold">
                    {preRegisto.nome_completo}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Data</p>
                  <p className="font-semibold">
                    {preRegisto.dia_falecimento}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#A0AEC0] uppercase">Causa</p>
                  <p className="font-semibold">
                    {preRegisto.causa_morte}
                  </p>
                </div>
              </>
            )}

          </div>

          <h3 className="text-xs font-bold text-[#003F20] uppercase tracking-wide mb-4 pt-4 border-t border-[#E2E8F0]">
            Preencher Dados em Falta
          </h3>

          {/* FORM NASCIMENTO */}
          {tipo === 'nascimento' && (

            <div className="grid grid-cols-2 gap-4">

              <Campo
                label="Nome da criança"
                value={form.nome_completo || preRegisto.nome_completo || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    nome_completo: v
                  }))
                }
              />

              <Campo
                label="Apelidos"
                value={form.apelidos || preRegisto.apelidos || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    apelidos: v
                  }))
                }
              />

              <Campo
                label="Avô paterno"
                value={form.avo_paterno || preRegisto.avo_paterno || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    avo_paterno: v
                  }))
                }
              />

              <Campo
                label="Avó paterna"
                value={form.avo_paterna || preRegisto.avo_paterna || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    avo_paterna: v
                  }))
                }
              />

              <Campo
                label="Avô materno"
                value={form.avo_materno || preRegisto.avo_materno || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    avo_materno: v
                  }))
                }
              />

              <Campo
                label="Avó materna"
                value={form.avo_materna || preRegisto.avo_materna || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    avo_materna: v
                  }))
                }
              />

              <Campo
                label="Nome do declarante"
                value={form.nome_declarante || preRegisto.nome_declarante || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    nome_declarante: v
                  }))
                }
              />

              <Campo
                label="BI do declarante"
                value={form.bi_declarante || preRegisto.bi_declarante || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    bi_declarante: v
                  }))
                }
              />

              <Campo
                label="Estado civil do declarante"
                value={form.estado_civil_declarante || preRegisto.estado_civil_declarante || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    estado_civil_declarante: v
                  }))
                }
              />

              <Campo
                label="Residência do declarante"
                value={form.residencia_declarante || preRegisto.residencia_declarante || ''}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    residencia_declarante: v
                  }))
                }
              />

              <div className="col-span-2">

                <label className="block text-xs text-[#718096] uppercase tracking-wide mb-1">
                  Relação com o menor
                </label>

                <select
                  value={form.relacao_declarante || preRegisto.relacao_declarante || 'outro'}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      relacao_declarante: e.target.value
                    }))
                  }
                  className="w-full border border-[#CBD5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#009A44]"
                >
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                  <option value="familiar">Familiar</option>
                  <option value="outro">Outro</option>
                </select>

              </div>

            </div>
          )}

          {/* FORM ÓBITO */}
          {tipo === 'obito' && (

            <div className="grid grid-cols-2 gap-4">

              <Campo
                label="Cemitério"
                value={form.cemiterio}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    cemiterio: v
                  }))
                }
              />

              <Campo
                label="Herdeiros"
                value={form.herdeiros}
                onChange={v =>
                  setForm(f => ({
                    ...f,
                    herdeiros: v
                  }))
                }
              />

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.bens_inventario}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      bens_inventario: e.target.checked
                    }))
                  }
                />

                <label className="text-sm text-[#4A5568]">
                  Bens sujeitos a inventário
                </label>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.testamento}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      testamento: e.target.checked
                    }))
                  }
                />

                <label className="text-sm text-[#4A5568]">
                  Testamento
                </label>
              </div>

            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#E2E8F0]">

            <label className="block text-xs text-[#718096] uppercase tracking-wide mb-1">
              Funcionário responsável
            </label>

            <input
              value={conservador}
              onChange={e => setConservador(e.target.value)}
              className="w-full max-w-sm border border-[#CBD5E0] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#009A44] mb-4"
            />

            <button
              onClick={confirmar}
              className="px-8 py-2.5 rounded text-sm font-bold text-white uppercase tracking-wide"
              style={{ backgroundColor: '#003F20' }}
            >
              Confirmar e Enviar para Aprovação
            </button>

          </div>

        </div>

      )}

    </div>
  )
}