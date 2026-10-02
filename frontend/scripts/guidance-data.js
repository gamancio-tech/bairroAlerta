const guidance = (resumo, antes, durante, depois, naoFazer, numero, nome, sinais) => ({
  resumo,
  ...(sinais ? { sinais } : {}),
  antes,
  durante,
  depois,
  naoFazer,
  ligar: { numero, nome }
});

window.BairroAlertaGuidance = {
  ENCHENTE: guidance(
    'Subida gradual ou rápida de rios e córregos que invade casas e ruas.',
    ['Conheça se sua casa fica em área de risco e onde ficam os abrigos da região', 'Guarde documentos e remédios em saco plástico bem fechado e em local alto', 'Monte um kit de emergência (água, lanterna, rádio a pilha, carregador portátil, remédios)', 'Combine com a família um ponto de encontro e um contato fora da região', 'Acompanhe os avisos da Defesa Civil'],
    ['Se a água estiver subindo, vá para um local alto e seguro sem esperar a água chegar', 'Se houver risco da água entrar em casa, desligue a energia pelo disjuntor geral, somente se o quadro estiver seco e fácil de alcançar', 'Leve crianças, idosos e animais com você', 'Siga as orientações da Defesa Civil e vá ao abrigo indicado', 'Peça ajuda pelo 199 ou 193 se ficar ilhado'],
    ['Só volte para casa quando as autoridades liberarem', 'Evite contato com a água da enchente, que pode estar contaminada (risco de leptospirose)', 'Descarte alimentos e água que tiveram contato com a enchente', 'Higienize paredes, pisos e objetos com água sanitária', 'Procure atendimento de saúde se tiver febre, dor no corpo ou dor de cabeça nos dias seguintes ao contato com a água', 'Fotografe os prejuízos para pedir apoio'],
    ['Não atravesse ruas alagadas a pé ou de carro', 'Não toque em fios, tomadas ou aparelhos elétricos com o corpo molhado ou dentro da água', 'Não fique em porões, subsolos ou garagens subterrâneas', 'Não volte para pegar objetos com a água subindo'],
    '199', 'Defesa Civil'
  ),
  ALAGAMENTO: guidance(
    'Acúmulo de água nas ruas por causa de chuva forte e bueiros que não dão vazão.',
    ['Mantenha calhas e ralos do imóvel limpos', 'Não jogue lixo nas ruas e bueiros', 'Evite estacionar em ruas baixas e garagens subterrâneas quando houver previsão de chuva forte', 'Tenha uma rota alternativa por locais mais altos'],
    ['Evite sair de casa; se estiver na rua, procure um local alto e fechado', 'Desligue e retire da tomada aparelhos eletrônicos se a água se aproximar', 'Se estiver de carro e a água subir, abandone o veículo apenas se for seguro e vá para um local alto', 'Avise vizinhos e a Defesa Civil se houver pessoas em risco'],
    ['Evite contato com a água parada, que pode estar contaminada', 'Lave e desinfete o que teve contato com a água', 'Só use aparelhos elétricos molhados depois de secos e verificados', 'Procure atendimento de saúde se aparecerem sintomas como febre e dor no corpo após contato com a água'],
    ['Não atravesse áreas alagadas, pois a profundidade e a correnteza não são visíveis', 'Não entre em túneis e passagens subterrâneas alagadas', 'Não pise em tampas de bueiro abertas ou deslocadas', 'Não toque em fios caídos ou postes dentro da água'],
    '199', 'Defesa Civil'
  ),
  CHUVA: guidance(
    'Chuva intensa que reduz a visibilidade e pode causar alagamentos, quedas de árvores e deslizamentos.',
    ['Acompanhe a previsão e os avisos da Defesa Civil', 'Recolha objetos soltos de varandas e quintais', 'Verifique telhado, calhas e ralos', 'Mantenha celular carregado e lanterna à mão'],
    ['Permaneça em local seguro e fechado até a chuva diminuir', 'Se estiver dirigindo, reduza a velocidade, ligue os faróis e mantenha distância', 'Se a visibilidade ficar muito ruim, pare em local seguro, longe de árvores e de áreas alagáveis', 'Fique atento a sinais de deslizamento se morar em encosta'],
    ['Observe rachaduras no terreno, nas paredes e no teto antes de circular pela casa', 'Evite áreas alagadas e com fios caídos', 'Informe a Defesa Civil sobre árvores caídas, bueiros entupidos e danos na rede elétrica'],
    ['Não se abrigue debaixo de árvores, placas ou estruturas soltas', 'Não circule em áreas alagadas', 'Não use aparelhos elétricos com a mão molhada ou em locais úmidos'],
    '199', 'Defesa Civil'
  ),
  DESLIZAMENTO: guidance(
    'Movimento de terra, lama e pedras em encostas, geralmente provocado por chuvas fortes e prolongadas.',
    ['Saiba se sua casa está em área de risco e onde fica o abrigo mais próximo', 'Evite construir ou jogar lixo e entulho em encostas', 'Em períodos de chuva forte, considere sair de casa antes do alerta se morar em área de risco', 'Combine com a família um ponto de encontro seguro'],
    ['Ao notar os sinais, saia imediatamente e avise os vizinhos', 'Afaste-se da encosta e da direção por onde a terra pode descer, indo para um local alto e estável', 'Ligue para 199 ou 193', 'Aguarde em abrigo indicado pela Defesa Civil'],
    ['Não volte para a área até a liberação das autoridades, pois podem ocorrer novos deslizamentos', 'Mantenha distância de áreas instáveis e de redes elétricas danificadas', 'Avise a Defesa Civil sobre pessoas desaparecidas e sobre danos em redes de água, gás e energia'],
    ['Não volte para buscar pertences quando houver sinais de movimento do terreno', 'Não fique embaixo ou perto da encosta', 'Não tente atravessar o material deslizado', 'Não ignore rachaduras e outros sinais'],
    '199 / 193', 'Defesa Civil / Bombeiros',
    ['Rachaduras novas no terreno, no piso ou nas paredes', 'Portas e janelas que passam a emperrar', 'Árvores, postes e muros inclinados', 'Água barrenta saindo de nascentes ou da encosta', 'Barulho de estalos, pedras rolando ou terra caindo', 'Degraus ou “barrigas” que surgem no terreno']
  ),
  TEMPESTADE: guidance(
    'Temporais com raios, trovões, granizo e ventos fortes.',
    ['Acompanhe os alertas de temporal', 'Recolha objetos soltos e feche portas e janelas', 'Guarde veículos em local coberto, se possível', 'Carregue celular e lanternas'],
    ['Fique dentro de casa ou de um prédio fechado, longe de janelas', 'Dentro do carro com a capota fechada você fica mais protegido', 'Desligue e desconecte aparelhos eletrônicos das tomadas', 'Se estiver ao ar livre sem abrigo, proteja a cabeça do granizo e procure local fechado o quanto antes', 'Aguarde cerca de 30 minutos após o último trovão para sair'],
    ['Cuidado com fios caídos, galhos e objetos soltos', 'Informe a companhia de energia sobre fios rompidos', 'Verifique telhados e janelas antes de usar os cômodos'],
    ['Não se abrigue debaixo de árvores isoladas, postes ou estruturas metálicas', 'Não fique em campos abertos, praias, piscinas ou topos de morros', 'Não use chuveiro, torneiras ou telefone com fio durante raios', 'Não toque em fios caídos'],
    '199', 'Defesa Civil'
  ),
  VENDAVAL: guidance(
    'Ventos fortes que podem derrubar árvores, destelhar casas e danificar a rede elétrica.',
    ['Fixe antenas, placas e objetos soltos em telhados, varandas e quintais', 'Faça a manutenção de telhados e esquadrias', 'Poda de árvores próximas a casas e fios deve ser feita por profissionais ou pelo órgão responsável', 'Tenha lanterna e carregador portátil à mão'],
    ['Fique em local fechado, afastado de janelas e portas', 'Abrigue-se em cômodo interno e resistente', 'Se estiver na rua, procure abrigo em prédio sólido', 'Se estiver dirigindo, pare longe de árvores, placas e fios'],
    ['Cuidado com fios caídos e estruturas instáveis', 'Informe a companhia de energia e a Defesa Civil sobre danos na rede', 'Não suba em telhados enquanto ainda houver vento forte', 'Verifique danos antes de entrar em áreas afetadas'],
    ['Não se abrigue sob árvores, placas, outdoors ou marquises', 'Não tente consertar telhado durante o vento', 'Não toque em fios caídos, mesmo que pareçam sem energia'],
    '199', 'Defesa Civil'
  ),
  CALOR_EXTREMO: guidance(
    'Períodos de temperaturas muito altas que podem causar desidratação e insolação.',
    ['Prepare-se para os dias quentes: mantenha água potável disponível', 'Use roupas leves, claras e protetor solar', 'Planeje atividades ao ar livre para horários mais frescos'],
    ['Beba água ao longo do dia, mesmo sem sede', 'Evite exposição direta ao sol entre 10h e 16h', 'Procure lugares frescos e ventilados e faça pausas', 'Cuide de crianças, idosos e pessoas com doenças crônicas, que sofrem mais com o calor', 'Em caso de sinais de insolação: leve a pessoa a um local fresco e à sombra, resfrie o corpo com panos úmidos e ligue 192'],
    ['Continue se hidratando e descanse', 'Procure atendimento de saúde se os sintomas persistirem', 'Verifique como estão vizinhos que moram sozinhos'],
    ['Não deixe crianças, idosos ou animais dentro de carros fechados, nem por poucos minutos', 'Não pratique exercício intenso nas horas mais quentes', 'Não consuma bebidas alcoólicas em excesso', 'Não dê líquidos à força a pessoa desmaiada ou confusa'],
    '192', 'SAMU',
    ['Sede intensa e boca seca', 'Dor de cabeça, tontura e cansaço excessivo', 'Pele muito quente, vermelha e seca, sem suor (sinal grave)', 'Confusão mental, desmaio ou convulsão (sinal grave, ligue 192 imediatamente)']
  ),
  OUTROS: guidance(
    'Orientações gerais para qualquer situação de risco na sua região.',
    ['Cadastre seu CEP para receber alertas da Defesa Civil por SMS (envie o CEP para 40199)', 'Monte um kit de emergência e converse com a família sobre um plano de saída', 'Salve os números de emergência no celular', 'Conheça os abrigos e rotas seguras da sua região'],
    ['Mantenha a calma e siga as orientações oficiais', 'Ajude quem precisa, sem se colocar em risco', 'Acompanhe informações por fontes oficiais e evite espalhar boatos', 'Em risco imediato, ligue 199 (Defesa Civil) ou 193 (Bombeiros)'],
    ['Só retorne a áreas afetadas quando liberado', 'Avise familiares que você está bem', 'Informe a Defesa Civil sobre danos e riscos que encontrar'],
    ['Não compartilhe informações que você não confirmou', 'Não entre em áreas isoladas ou interditadas', 'Não retorne a áreas afetadas sem liberação'],
    '199', 'Defesa Civil'
  )
};

window.BairroAlertaKit = [
  'Água potável (pelo menos 3 litros por pessoa por dia)',
  'Alimentos não perecíveis',
  'Lanterna e pilhas extras',
  'Rádio a pilha',
  'Carregador portátil (power bank)',
  'Documentos em saco plástico',
  'Remédios de uso contínuo',
  'Kit de primeiros socorros',
  'Cópia dos contatos de emergência',
  'Roupas e cobertor',
  'Apito (para sinalizar ajuda)'
];

window.BairroAlertaFamilyPlan = [
  'Qual será nosso ponto de encontro?',
  'Quem é nosso contato fora da região?',
  'Qual é a rota de saída mais segura?'
];
