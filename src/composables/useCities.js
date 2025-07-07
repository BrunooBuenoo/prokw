import { ref, computed } from "vue"

export function useCities() {
  const cities = ref([])
  const loading = ref(false)
  const searchTerm = ref("")

  // Cache para evitar múltiplas requisições
  let citiesCache = null

  const loadCities = async () => {
    console.log("🏙️ Carregando cidades...")

    if (citiesCache) {
      console.log("✅ Usando cache com", citiesCache.length, "cidades")
      cities.value = citiesCache
      return
    }

    try {
      loading.value = true
      console.log("🌐 Fazendo requisição para API do IBGE...")
      const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Dados recebidos:", data.length, "cidades")

      // Formatar dados com verificações de segurança: "Cidade - UF"
      const formattedCities = data
        .filter((city) => {
          // Filtrar apenas cidades com estrutura válida
          return (
            city &&
            city.nome &&
            city.microrregiao &&
            city.microrregiao.mesorregiao &&
            city.microrregiao.mesorregiao.UF &&
            city.microrregiao.mesorregiao.UF.sigla
          )
        })
        .map((city) => ({
          id: city.id,
          name: city.nome,
          state: city.microrregiao.mesorregiao.UF.sigla,
          fullName: `${city.nome} - ${city.microrregiao.mesorregiao.UF.sigla}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      cities.value = formattedCities
      citiesCache = formattedCities
      console.log("✅ Cidades processadas:", formattedCities.length, "cidades válidas")
    } catch (error) {
      console.error("❌ Erro ao carregar cidades:", error)

      // Fallback com principais cidades brasileiras
      console.log("🔄 Usando fallback com principais cidades...")
      const fallbackCities = [
        { id: 1, name: "São Paulo", state: "SP", fullName: "São Paulo - SP" },
        { id: 2, name: "Rio de Janeiro", state: "RJ", fullName: "Rio de Janeiro - RJ" },
        { id: 3, name: "Belo Horizonte", state: "MG", fullName: "Belo Horizonte - MG" },
        { id: 4, name: "Brasília", state: "DF", fullName: "Brasília - DF" },
        { id: 5, name: "Salvador", state: "BA", fullName: "Salvador - BA" },
        { id: 6, name: "Fortaleza", state: "CE", fullName: "Fortaleza - CE" },
        { id: 7, name: "Curitiba", state: "PR", fullName: "Curitiba - PR" },
        { id: 8, name: "Recife", state: "PE", fullName: "Recife - PE" },
        { id: 9, name: "Porto Alegre", state: "RS", fullName: "Porto Alegre - RS" },
        { id: 10, name: "Manaus", state: "AM", fullName: "Manaus - AM" },
        { id: 11, name: "Belém", state: "PA", fullName: "Belém - PA" },
        { id: 12, name: "Goiânia", state: "GO", fullName: "Goiânia - GO" },
        { id: 13, name: "Campinas", state: "SP", fullName: "Campinas - SP" },
        { id: 14, name: "São Luís", state: "MA", fullName: "São Luís - MA" },
        { id: 15, name: "São Gonçalo", state: "RJ", fullName: "São Gonçalo - RJ" },
        { id: 16, name: "Maceió", state: "AL", fullName: "Maceió - AL" },
        { id: 17, name: "Duque de Caxias", state: "RJ", fullName: "Duque de Caxias - RJ" },
        { id: 18, name: "Teresina", state: "PI", fullName: "Teresina - PI" },
        { id: 19, name: "Natal", state: "RN", fullName: "Natal - RN" },
        { id: 20, name: "Campo Grande", state: "MS", fullName: "Campo Grande - MS" },
        { id: 21, name: "Nova Iguaçu", state: "RJ", fullName: "Nova Iguaçu - RJ" },
        { id: 22, name: "São Bernardo do Campo", state: "SP", fullName: "São Bernardo do Campo - SP" },
        { id: 23, name: "João Pessoa", state: "PB", fullName: "João Pessoa - PB" },
        { id: 24, name: "Santo André", state: "SP", fullName: "Santo André - SP" },
        { id: 25, name: "Osasco", state: "SP", fullName: "Osasco - SP" },
        { id: 26, name: "Jaboatão dos Guararapes", state: "PE", fullName: "Jaboatão dos Guararapes - PE" },
        { id: 27, name: "São José dos Campos", state: "SP", fullName: "São José dos Campos - SP" },
        { id: 28, name: "Ribeirão Preto", state: "SP", fullName: "Ribeirão Preto - SP" },
        { id: 29, name: "Uberlândia", state: "MG", fullName: "Uberlândia - MG" },
        { id: 30, name: "Contagem", state: "MG", fullName: "Contagem - MG" },
        { id: 31, name: "Aracaju", state: "SE", fullName: "Aracaju - SE" },
        { id: 32, name: "Cuiabá", state: "MT", fullName: "Cuiabá - MT" },
        { id: 33, name: "Sorocaba", state: "SP", fullName: "Sorocaba - SP" },
        { id: 34, name: "Feira de Santana", state: "BA", fullName: "Feira de Santana - BA" },
        { id: 35, name: "Joinville", state: "SC", fullName: "Joinville - SC" },
        { id: 36, name: "Londrina", state: "PR", fullName: "Londrina - PR" },
        { id: 37, name: "Niterói", state: "RJ", fullName: "Niterói - RJ" },
        { id: 38, name: "Ananindeu", state: "PA", fullName: "Ananindeu - PA" },
        { id: 39, name: "Belford Roxo", state: "RJ", fullName: "Belford Roxo - RJ" },
        { id: 40, name: "Caxias do Sul", state: "RS", fullName: "Caxias do Sul - RS" },
        { id: 41, name: "Campos dos Goytacazes", state: "RJ", fullName: "Campos dos Goytacazes - RJ" },
        { id: 42, name: "Macapá", state: "AP", fullName: "Macapá - AP" },
        { id: 43, name: "Vila Velha", state: "ES", fullName: "Vila Velha - ES" },
        { id: 44, name: "Florianópolis", state: "SC", fullName: "Florianópolis - SC" },
        { id: 45, name: "São João de Meriti", state: "RJ", fullName: "São João de Meriti - RJ" },
        { id: 46, name: "Santos", state: "SP", fullName: "Santos - SP" },
        { id: 47, name: "Vitória", state: "ES", fullName: "Vitória - ES" },
        { id: 48, name: "Serra", state: "ES", fullName: "Serra - ES" },
        { id: 49, name: "Guarulhos", state: "SP", fullName: "Guarulhos - SP" },
        { id: 50, name: "Diadema", state: "SP", fullName: "Diadema - SP" },
        { id: 51, name: "Carapicuíba", state: "SP", fullName: "Carapicuíba - SP" },
        { id: 52, name: "Mauá", state: "SP", fullName: "Mauá - SP" },
        { id: 53, name: "São Vicente", state: "SP", fullName: "São Vicente - SP" },
        { id: 54, name: "Olinda", state: "PE", fullName: "Olinda - PE" },
        { id: 55, name: "Guarujá", state: "SP", fullName: "Guarujá - SP" },
        { id: 56, name: "Caruaru", state: "PE", fullName: "Caruaru - PE" },
        { id: 57, name: "Montes Claros", state: "MG", fullName: "Montes Claros - MG" },
        { id: 58, name: "Piracicaba", state: "SP", fullName: "Piracicaba - SP" },
        { id: 59, name: "Bauru", state: "SP", fullName: "Bauru - SP" },
        { id: 60, name: "Porto Velho", state: "RO", fullName: "Porto Velho - RO" },
        { id: 61, name: "Franca", state: "SP", fullName: "Franca - SP" },
        { id: 62, name: "Petrópolis", state: "RJ", fullName: "Petrópolis - RJ" },
        { id: 63, name: "Vitória da Conquista", state: "BA", fullName: "Vitória da Conquista - BA" },
        { id: 64, name: "Uberaba", state: "MG", fullName: "Uberaba - MG" },
        { id: 65, name: "Paulista", state: "PE", fullName: "Paulista - PE" },
        { id: 66, name: "Limeira", state: "SP", fullName: "Limeira - SP" },
        { id: 67, name: "Blumenau", state: "SC", fullName: "Blumenau - SC" },
        { id: 68, name: "Suzano", state: "SP", fullName: "Suzano - SP" },
        { id: 69, name: "Pelotas", state: "RS", fullName: "Pelotas - RS" },
        { id: 70, name: "Canoas", state: "RS", fullName: "Canoas - RS" },
        { id: 71, name: "Marília", state: "SP", fullName: "Marília - SP" },
        { id: 72, name: "Presidente Prudente", state: "SP", fullName: "Presidente Prudente - SP" },
        { id: 73, name: "Taubaté", state: "SP", fullName: "Taubaté - SP" },
        { id: 74, name: "Boa Vista", state: "RR", fullName: "Boa Vista - RR" },
        { id: 75, name: "Rio Branco", state: "AC", fullName: "Rio Branco - AC" },
      ].sort((a, b) => a.name.localeCompare(b.name))

      cities.value = fallbackCities
      citiesCache = fallbackCities
    } finally {
      loading.value = false
    }
  }

  const filteredCities = computed(() => {
    if (!searchTerm.value || searchTerm.value.length < 2) {
      return []
    }

    const term = searchTerm.value.toLowerCase()
    return cities.value
      .filter((city) => city.name.toLowerCase().includes(term) || city.fullName.toLowerCase().includes(term))
      .slice(0, 10) // Limitar a 10 resultados
  })

  return {
    cities,
    loading,
    searchTerm,
    filteredCities,
    loadCities,
  }
}
